import { useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'

const renderBarcode = JsBarcode

export const Barcode = ({ ticketId }) => {
    const svgReference = useRef(null)

    useEffect(() => {
        if (svgReference.current && ticketId) {
            try {
                renderBarcode(svgReference.current, ticketId, {
                    format: 'CODE128',
                    width: 1.5,
                    height: 36,
                    displayValue: false,
                    margin: 0,
                    lineColor: '#1E293B'
                })
            } catch {
                /* empty */
            }
        }
    }, [ticketId])

    if (!ticketId) {
        return null
    }

    return (
        <div className="w-full flex flex-col items-center justify-center">
            <svg ref={svgReference} className="mx-auto block" />
            <div className="w-full text-center text-slate-900 text-xs font-normal font-['B612_Mono',monospace] tracking-wider mt-1">
                *{ticketId}*
            </div>
        </div>
    )
}
