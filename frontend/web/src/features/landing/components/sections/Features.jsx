import { Icon } from '@/components/ui/Icon'

const features = Object.freeze([
    {
        icon: 'eye',
        title: 'Real-Time Availability',
        description: 'View the current availability and status of equipment before submitting a borrowing request.'
    },
    {
        icon: 'task',
        title: 'Digital Borrowing',
        description:
            'Submit equipment borrowing requests online and keep track of your borrowing transactions digitally.'
    },
    {
        icon: 'inventory',
        title: 'Inventory Monitoring',
        description:
            'Monitor equipment records, borrowing history, and inventory status through one centralized system.'
    }
])

export const Features = () => (
    <section
        id="features"
        className="min-h-screen py-20 flex items-center justify-center overflow-x-hidden features-gradient">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 w-full">
            <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8">
                {features.map(({ icon, title, description }) => (
                    <div
                        key={title}
                        className="w-full max-w-[392px] min-h-[220px] lg:h-[248px] flex flex-col items-center justify-center gap-2 p-6 lg:p-[32px] rounded-[8px] bg-surface-muted border border-placeholder hover:bg-primary-tint hover:border-border-sky transition-colors">
                        <Icon name={icon} className="w-6 h-6 shrink-0" />
                        <h2 className="text-text text-xl lg:text-[24px] font-semibold text-center">{title}</h2>
                        <p className="text-text text-[15px] lg:text-[18px] text-center leading-relaxed">
                            {description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    </section>
)
