import { useState, useEffect, useRef } from 'react'
import './App.css'
import 'mathlive'
import { MathfieldElement } from 'mathlive'
import { ComputeEngine } from '@cortex-js/compute-engine'

import Header from './components/Header'
import Footer from './components/Footer'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': React.DetailedHTMLProps<React.HTMLAttributes<MathfieldElement>, MathfieldElement>
    }
  }
}

const ce = new ComputeEngine()

function App() {
  const [value, setValue] = useState<String>('y=x')
  const mf = useRef();
  useEffect(() => {
    mf.current.mathVirtualKeyboardPolicy = 'manual'
    mf.current.addEventListener("focusin", (evt) => {
      window.mathVirtualKeyboard.show()
    })
    mf.current.addEventListener("focusout", (evt) => {
      window.mathVirtualKeyboard.hide()
    })
  })

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
            }
          }
        >
          {value}
        </math-field>
        <p>Your formula: { value }</p>
        <p>Result: {
          //@ts-ignore
          ce.parse(value).simplify().toString() 
        }</p>
      </div>
      <Footer />
    </>
  )
}

export default App
