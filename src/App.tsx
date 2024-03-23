import React, { useState, useEffect, useRef, useContext } from 'react'
import './App.css'
import 'mathlive'
import { MathfieldElement } from 'mathlive'
import { ComputeEngine } from '@cortex-js/compute-engine'

import Header from './components/Header'
import Footer from './components/Footer'
import Variable from './components/Variable'

import { DataContext } from './utils/DataContext'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': React.DetailedHTMLProps<React.HTMLAttributes<MathfieldElement>, MathfieldElement>
    }
  }
}

export const ce = new ComputeEngine()
ce.jsonSerializationOptions = {

}
ce.numericMode = 'bignum'
ce.precision = 15

function synthetic(formula: String, symbols: String[], value: String) {
  symbols = percolateSymbol(symbols)
  formula.replace('e', ce.parse('ExponentialE').N().toString())
  formula.replace('\\pi', ce.parse('Pi').N().toString())
  formula.replace('\\Pi', ce.parse('Pi').N().toString())
  console.log(formula)
  const isMul = true
  // @ts-ignore
  //console.log(ce.parse(formula).evaluate().toString())
  // @ts-ignore
  const preFormula = isMul ? ce.box(['Ln', ce.parse(formula)]) : ce.parse(formula)
  let part = []
  //@ts-ignore
  for (let i = 0; i < symbols.length; i++) {
    //@ts-ignore
    part.push(ce.box(['D', preFormula, ce.parse(symbols[i])]).evaluate())
  }
  // @ts-ignore
  let res = ce.box(['Sqrt', part.map((data, i) => ce.box(['Multiply', ['Square', data], ['Square', ce.parse('Δ_' + symbols[i])]])).reduce((a, b) => ce.box(['Add', a, b]), 0)])
 
  // @ts-ignore
  if (!isMul) {
    // @ts-ignore
    res = ce.box(['Equal', ce.parse(value), res])
  } else {
    // @ts-ignore
    res = ce.box(['Equal', ce.box(['Divide', 'Δ_'+value, ce.parse(value)]), res])
  }
  
  //console.log(res.toString())
  return res
}

function percolateSymbol(symbols: String[]) {
  const specialSymbol = ['e', 'pi', 'Pi', 'N', 'D', 'ND', 'ExponentialE', 'i', 'ImaginaryUnit']
  // @ts-ignore
  return symbols.filter((data) => !specialSymbol.includes(data))
}

function App() {
  const [value, setValue] = useState<String>('y=x')

  const mfm = useRef();
  useEffect(() => {
    // @ts-ignore
    mfm.current.mathVirtualKeyboardPolicy = 'manual'
    // @ts-ignore
    mfm.current.addEventListener("focusin", (evt) => {
      window.mathVirtualKeyboard.show()
      window.mathVirtualKeyboard.layouts = ['numeric', 'symbols', 'alphabetic']
    })
    // @ts-ignore
    mfm.current.addEventListener("focusout", (evt) => {
      window.mathVirtualKeyboard.hide()
    })
  })

  const [numberOfComponents, setNumberOfComponents] = useState(0)
  const contextValue = useContext(DataContext)
  const { componentsData, updateData } = contextValue || {}
  const handleNumberOfComponents = (num: number) => {
    setNumberOfComponents(num)
  }
  const calculateFinalResult = () => {
    if (!(value.split('=').length == 2 && value.split('=')[1] !== '')) {
      return ["请输入完整的公式（包含单个等号，等号左侧应为单个变量，形如y=x）"]
    }
    let uncertaintyExpr = ce.parse(synthetic(value.split('=')[1], percolateSymbol(ce.parse(value.split('=')[1]).symbols), value.split('=')[0]).latex.split('=')[1]) ? ce.parse(synthetic(value.split('=')[1], percolateSymbol(ce.parse(value.split('=')[1]).symbols), value.split('=')[0]).latex.split('=')[1]) : ce.parse('0')

    let data = componentsData ? componentsData : []
    while (data?.length < numberOfComponents) {
      data = data?.concat({ value: '0', uncertainty: '0' })
    }

    let variate = {}
    for (let i = 0; i < data.length; i++) {
      // @ts-ignore
      variate[percolateSymbol(ce.parse(value.split('=')[1]).symbols)[i]] = ce.parse(data[i].value).value
      // @ts-ignore
      variate['Delta_' + percolateSymbol(ce.parse(value.split('=')[1]).symbols)[i]] = ce.parse(data[i].uncertainty).value
    }
    
    // @ts-ignore
    const sum = [ce.parse(value.split('=')[1]).subs(variate).evaluate().N().toString(), uncertaintyExpr.subs(variate).evaluate().N().toString(), ce.box(['Multiply', uncertaintyExpr, ce.parse(value.split('=')[1])]).subs(variate).evaluate().N().toString()]
    
    console.log(variate)
    return sum
  }

  return (
    <>
      <Header />
      <div className="App">
        <math-field
          id="compute-formula"
          //@ts-ignore
          ref={mfm}
          //@ts-ignore
          onInput={
            (evt: React.ChangeEvent<HTMLElement>) => {
              setValue((evt.target as HTMLInputElement).value)
              // @ts-ignore
              handleNumberOfComponents(percolateSymbol(ce.parse((evt.target as HTMLInputElement).value.split('=')[1]).symbols).length)
            }
          }
        >
          {value}
        </math-field>
        <p>您输入的公式: {
          //@ts-ignore
          (value.split('=').length == 2 && value.split('=')[1] !== '') ? <math-field read-only style={{display: "inline-block"}}>{ce.parse(value).simplify().latex}</math-field> : '请输入完整的公式（包含单个等号，等号左侧应为单个变量，形如y=x）'
        }</p>
        <p>此公式中的变量有: {
          //@ts-ignore
          (value.split('=').length == 2 && value.split('=')[1] !== '') ? percolateSymbol(ce.parse(value.split('=')[1]).symbols).join(', ') : '请输入完整的公式（包含单个等号，等号左侧应为单个变量，形如y=x）'
        }</p>
        <div className='variable-child'>此公式的不确定度传递公式: &nbsp; {
          //@ts-ignore
          (value.split('=').length == 2 && value.split('=')[1] !== '') ? 
          <div className='variable-child'>
            <math-field read-only style={{display: "inline-block"}}>
              {synthetic(value.split('=')[1], ce.parse(value.split('=')[1]).symbols, value.split('=')[0]).latex}
            </math-field>
            <p> = {calculateFinalResult()[1]}</p>
          </div> 
          : '请输入完整的公式（包含单个等号，等号左侧应为单个变量，形如y=x）'
        }</div>
        {Array.from({ length: numberOfComponents }, (_, i) => (
          <Variable key={i} ind={i} v={percolateSymbol(ce.parse(value.split('=')[1]).symbols)[i].toString()} />
        ))}
        <div className='variable-child'>平均预测值为: &nbsp; {
          (value.split('=').length == 2 && value.split('=')[1] !== '') ?
          <div className='variable-child'>
            <math-field read-only style={{display: "inline-block"}}>
              {'\\overline{' + ce.parse(value.split('=')[0]).latex + '}'}
            </math-field>
            <p> = {calculateFinalResult()[0]}</p>
          </div>
          : '请输入完整的公式（包含单个等号，等号左侧应为单个变量，形如y=x）'
        }, 总不确定度为: &nbsp; {
          (value.split('=').length == 2 && value.split('=')[1] !== '') ?
          <div className='variable-child'>
            <math-field read-only style={{display: "inline-block"}}>
              {'Δ_' + ce.parse(value.split('=')[0]).latex}
            </math-field>
            <p> = {calculateFinalResult()[2]}</p>
          </div>
          : '请输入完整的公式（包含单个等号，等号左侧应为单个变量，形如y=x）'
        }</div>
      </div>
      <Footer />
    </>
  )
}

export default App
