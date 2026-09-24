import { cn } from 'cn'
import { Icon } from '@/components/ui/Icon'

const procedures = Object.freeze([
    {
        number: 1,
        icon: 'procedureSearch',
        title: 'Browse Equipment',
        description: 'Check equipment availability and\nfind what you need.',
        iconSize: 'w-5 h-5'
    },
    {
        number: 2,
        icon: 'procedureTasklist',
        title: 'Submit a Request',
        description: 'Choose your equipment and submit\na borrowing request online.',
        iconSize: 'w-[18px] h-5'
    },
    {
        number: 3,
        icon: 'procedureBell',
        title: 'Track Your Request',
        description: 'Stay updated on your request status\nand due dates.',
        iconSize: 'w-5 h-5'
    },
    {
        number: 4,
        icon: 'procedureEquipment',
        title: 'Check Out Equipment',
        description: 'Collect approved equipment and\nrecord your transaction digitally.',
        iconSize: 'w-[18px] h-[18px]'
    },
    {
        number: 5,
        icon: 'procedureUndo',
        title: 'Return Equipment',
        description: 'Return the equipment and complete\nthe digital check-in process.',
        iconSize: 'w-[15px] h-[17px]'
    },
    {
        number: 6,
        icon: 'procedureHistory',
        title: 'View Borrowing History',
        description: 'Review your past borrowing\ntransactions and equipment\nrecords.',
        iconSize: 'w-[15px] h-[17px]'
    }
])

const gridPositions = Object.freeze({
    1: 'lg:col-start-1 lg:row-start-1',
    2: 'lg:col-start-2 lg:row-start-1',
    3: 'lg:col-start-3 lg:row-start-1',
    4: 'lg:col-start-3 lg:row-start-2',
    5: 'lg:col-start-2 lg:row-start-2',
    6: 'lg:col-start-1 lg:row-start-2'
})

export const HowItWorks = () => (
    <section
        id="how-it-works"
        className="min-h-screen py-16 sm:py-20 flex items-center justify-center overflow-x-hidden features-gradient">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 w-full flex flex-col gap-10 sm:gap-12">
            <div className="flex flex-col items-center gap-2 text-center">
                <p className="text-primary text-[16px]">How it works?</p>
                <h2 className="text-text text-xl sm:text-[24px] font-semibold">
                    A simpler way to borrow, track, and return equipment.
                </h2>
            </div>
            <div className="grid grid-cols-1 justify-items-center gap-10 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
                {procedures.map((step) => (
                    <div
                        key={step.number}
                        className={cn('flex flex-col items-center gap-2 w-full max-w-[340px]', gridPositions[step.number])}>
                        <div className="w-[80px] h-[80px] flex items-center justify-center rounded-full bg-primary shadow-procedure">
                            <span className="text-surface text-[24px] font-semibold">{step.number}</span>
                        </div>
                        {step.icon ? <Icon name={step.icon} className={step.iconSize} /> : null}
                        <h3 className="text-text text-[18px] font-bold">{step.title}</h3>
                        <p className="text-text text-[14px] text-center whitespace-pre-line">{step.description}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
)
