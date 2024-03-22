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

function bessel(formula: String, symbols: String[]) {
  let res = []
  //@ts-ignore
  for (let i = 0; i < symbols.length; i++) {
    //@ts-ignore
    res.push(ce.box(["D", ce.parse(formula), ce.parse(symbols[i])]))
  }
  return res
}

function App() {
  const [value, setValue] = useState<String>('y=x')

  const mf = useRef();
  useEffect(() => {
    // @ts-ignore
    mf.current.mathVirtualKeyboardPolicy = 'manual'
    // @ts-ignore
    mf.current.addEventListener("focusin", (evt) => {
      window.mathVirtualKeyboard.show()
    })
    // @ts-ignore
    mf.current.addEventListener("focusout", (evt) => {
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
    const sum = componentsData ? componentsData.map((data, index) => {
      return [data.value, data.uncertainty]
    }) : [0, 0]
    console.log(componentsData)
    return sum
  }
  const finalResult = calculateFinalResult()

  return (
    <>
      <Header />
      <div className="App">
        <math-field
          id="compute-formula"
          //@ts-ignore
          ref={mf}
          //@ts-ignore
          onInput={
            (evt: React.ChangeEvent<HTMLElement>) => {
              setValue((evt.target as HTMLInputElement).value)
              // @ts-ignore
              handleNumberOfComponents(ce.parse((evt.target as HTMLInputElement).value.split('=')[1]).symbols.length)
            }
          }
        >
          {value}
        </math-field>
        <p>您输入的公式: {
          //@ts-ignore
          (value.split('=').length == 2) ? ce.parse(value.split('=')[1]).simplify().toString() : '请输入完整的公式（包含单个等号，等号左侧应为单个变量，形如y=x）'
        }</p>
        <p>不确定度传递公式: {
          //@ts-ignore
          (value.split('=').length == 2) ? bessel(value.split('=')[1], ce.parse(value.split('=')[1]).symbols).map(x => x.evaluate().toString()) : '请输入完整的公式（包含单个等号，等号左侧应为单个变量，形如y=x）'
        }</p>
        <p>变量: {
          //@ts-ignore
          (value.split('=').length == 2) ? ce.parse(value.split('=')[1]).symbols : '请输入完整的公式（包含单个等号，等号左侧应为单个变量，形如y=x）'
        }</p>
        {Array.from({ length: numberOfComponents }, (_, i) => (
          <Variable key={i} ind={i} v={ce.parse(value.split('=')[1]).symbols[i].toString()} />
        ))}
        <p>结果: {finalResult}</p>
      </div>
      <Footer />
    </>
  )
}

export default App
