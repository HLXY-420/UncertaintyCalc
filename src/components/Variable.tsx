import 'mathlive'
import React, { useState, useEffect, useRef, useContext } from 'react'
import { DataContext } from '../utils/DataContext'
import { ce } from '../App'

interface Selection {
    label: String
}

export default function Variable(props: { ind: number, v: String }) {
  const [selectedOption, setSelectedOption] = useState<Selection>({ label: '多组测量值（默认）' })
  const options: Selection[] = [
    { label: '多组测量值（默认）' },
    { label: '已知值/单组测量值' },
  ]
  const handleSelectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(options.find((option) => option.label === event.target.value)!)
  }

  return (
    <div className='variable'>
      <p>变量 {props.v}</p>
      <select //@ts-ignore
        value={selectedOption.label} onChange={handleSelectionChange}>
        {options.map((option) => (
          <option //@ts-ignore
          ind={option.label} value={option.label}>
            {option.label}
          </option>
        ))}
      </select>

      <p>
        {selectedOption.label === '多组测量值（默认）' ? <MultipleValues ind={props.ind} /> : <SingleValue ind={props.ind} />}
      </p>
    </div>
  )
}

function SingleValue(props: { ind: number }) {
    const [value, setValue] = useState<String[]>(['0', '0'])
    const handleInputChange = (index: number, input: HTMLInputElement) => {
        const newInputs = [...value]
        newInputs[index] = input.value
        setValue(newInputs)
        handleUpdateData(newInputs)
    }

    const contextValue = useContext(DataContext)
    const { updateData } = contextValue || {}
    const handleUpdateData = (input: String[]) => {
        if (updateData) {
            updateData(props.ind, { value: input[0], uncertainty: input[1] })
        }
    }

    const mf = useRef()
    useEffect(() => {
      // @ts-ignore
      mf.current.mathVirtualKeyboardPolicy = 'manual'
      // @ts-ignore
      mf.current.addEventListener("focusin", (evt) => {
        window.mathVirtualKeyboard.show()
        window.mathVirtualKeyboard.layouts = 'numeric-only'
      })
      // @ts-ignore
      mf.current.addEventListener("focusout", (evt) => {
        window.mathVirtualKeyboard.hide()
      })
    })

    return (
        <div className='variable-child'>
            <p>值: </p>
            <math-field
              // @ts-ignore
              ref={mf}
              onInput={
                (evt) => {
                    handleInputChange(0, evt.target as HTMLInputElement)
                }
              }
            >{value[0]}</math-field>
            <p>不确定度（如无请填 0）: </p>
            <math-field
              // @ts-ignore
              ref={mf}
              onInput={
                (evt) => {
                    handleInputChange(1, evt.target as HTMLInputElement)
                }
              } 
            >{value[1]}</math-field>
        </div>
    )
}

function MultipleValues(props: { ind: number }) {
    const [value, setValue] = useState<String[]>(['0', '0', '0', '0', '0', '0'])
    const [inst, setInst] = useState<String>('0')
    const [result, setResult] = useState<String[]>(['0', '0', '0'])
    const handleInputChange = (index: number, input: HTMLInputElement) => {
        const newInputs = [...value]
        newInputs[index] = input.value
        setValue(newInputs)

        const sum = newInputs.map((data, _) => {
            // @ts-ignore
            return data ? ( data.endsWith('.') ? ce.parse(data + '0') : ce.parse(data) ) : ce.parse('0')
        })
        // @ts-ignore
        const mean = ce.box(['Divide', sum.reduce((a, b) => ce.box(['Add', a, b]), 0), ce.parse('6')]).N().toString()
        // @ts-ignore
        const standardDeviation = ce.box(['Sqrt', ce.box(['Divide', sum.map((data, _) => ce.box(['Square', ['Subtract', data, ce.parse(mean)]])).reduce((a, b) => ce.box(['Add', a, b])), 5])]).N().toString()
        // @ts-ignore
        const totalUncertainty = ce.box(['Sqrt', ce.box(['Add', ce.box(['Sqrt', ( inst.endsWith('.') ? ce.parse(inst + '0') : ce.parse(inst) )]), ce.box(['Square', ce.parse(standardDeviation)])])]).N().toString()

        setResult([mean, standardDeviation, totalUncertainty])
        
        handleUpdateData([mean, totalUncertainty])
    }

    const contextValue = useContext(DataContext)
    const { updateData } = contextValue || {}
    const handleUpdateData = (input: String[]) => {
        if (updateData) {
            updateData(props.ind, { value: input[0], uncertainty: input[1] })
        }
    }

    const mf = useRef()
    useEffect(() => {
      // @ts-ignore
      mf.current.mathVirtualKeyboardPolicy = 'manual'
      // @ts-ignore
      mf.current.addEventListener("focusin", (evt) => {
        window.mathVirtualKeyboard.layouts = 'numeric-only'
      })
    })

    return (
        <>
        <div className='variable-child'>
            <p>测量值（6组）: </p>
            <math-field
              // @ts-ignore
              ref={mf}
              onInput={(evt) => handleInputChange(0, evt.target as HTMLInputElement)}
            >{value[0]}</math-field>
            <math-field
              // @ts-ignore
              ref={mf}
              onInput={(evt) => handleInputChange(1, evt.target as HTMLInputElement)}
            >{value[1]}</math-field>
            <math-field
              // @ts-ignore
              ref={mf}
              onInput={(evt) => handleInputChange(2, evt.target as HTMLInputElement)}
            >{value[2]}</math-field>
            <math-field
              // @ts-ignore
              ref={mf}
              onInput={(evt) => handleInputChange(3, evt.target as HTMLInputElement)}
            >{value[3]}</math-field>
            <math-field
              // @ts-ignore
              ref={mf}
              onInput={(evt) => handleInputChange(4, evt.target as HTMLInputElement)}
            >{value[4]}</math-field>
            <math-field
              // @ts-ignore
              ref={mf}
              onInput={(evt) => handleInputChange(5, evt.target as HTMLInputElement)}
            >{value[5]}</math-field>
        </div>
        <div className='variable-child'>
            <p>仪器误差: </p>
            <math-field
              // @ts-ignore
              ref={mf}
              // @ts-ignore
              onInput={
                (evt: React.ChangeEvent<HTMLElement>) => {
                  setInst((evt.target as HTMLInputElement).value)
                  const sum = value.map((data, _) => {
                    // @ts-ignore
                    return data ? ( data.endsWith('.') ? ce.parse(data + '0') : ce.parse(data) ) : ce.parse('0')
                  })
                  // @ts-ignore
                  const mean = ce.box(['Divide', sum.reduce((a, b) => ce.box(['Add', a, b]), 0), ce.parse('6')]).N().toString()
                  // @ts-ignore
                  const standardDeviation = ce.box(['Sqrt', ce.box(['Divide', sum.map((data, _) => ce.box(['Square', ['Subtract', data, ce.parse(mean)]])).reduce((a, b) => ce.box(['Add', a, b])), 5])]).N().toString()
                  // @ts-ignore
                  const totalUncertainty = ce.box(['Sqrt', ce.box(['Add', ce.box(['Square', ( ce.parse((evt.target as HTMLInputElement).value.endsWith('.') ? (evt.target as HTMLInputElement).value + '0' : (evt.target as HTMLInputElement).value ))]), ce.box(['Square', ce.parse(standardDeviation)])])]).N().toString()        
                  setResult([mean, standardDeviation, totalUncertainty])
                
                  handleUpdateData([mean, totalUncertainty])
                }
              }
            >{inst}</math-field>
            <p>计算结果：平均值: {// @ts-ignore
            ce.parse(result[0]).N().value} 标准差Sx: {result[1]} 不确定度: {result[2]}</p>
        </div>
        </>
    )
}