import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it } from 'vite-plus/test'
import { OtpInput } from '@/components/ui/OtpInput'

const TestInput = () => {
    const [value, setValue] = useState('123456')
    return <OtpInput value={value} onChange={setValue} />
}

it('keeps other digits in place when a middle digit is deleted and replaced', () => {
    render(<TestInput />)
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[2], { target: { value: '' } })
    expect(inputs.map((input) => input.value)).toEqual(['1', '2', '', '4', '5', '6'])
    fireEvent.change(inputs[2], { target: { value: '9' } })
    expect(inputs.map((input) => input.value)).toEqual(['1', '2', '9', '4', '5', '6'])
})
