@include('emails.partials.font')
<div style="max-width: 560px; margin: 0 auto; padding: 32px 24px; background-color: #f8fafc; font-family: 'Poppins', 'Roboto', 'Segoe UI', Arial, sans-serif;">
	<div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 32px;">
		@include('emails.partials.header')

		<h2 style="font-size: 20px; font-weight: 700; color: #0F4C81; margin: 0 0 16px 0;">
			Equipment Return Reminder
		</h2>

		<p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 20px 0;">
			Hi {{ $firstname }}, your borrowed equipment for slip <strong style="color: #1e293b;">#{{ $ticketId }}</strong> is due for return.
		</p>

		<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px; font-size: 14px; color: #475569;">
			@if(!empty($startDate))
				<div style="margin-bottom: 8px;"><strong style="color: #1e293b;">Start Date:</strong> {{ $startDate }}</div>
			@endif
			<div><strong style="color: #1e293b;">Target Return:</strong> <span style="color: #0F4C81; font-weight: 600;">{{ $dueDate }}</span></div>
		</div>

		<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
			<div style="font-size: 13px; font-weight: 600; color: #64748b; text-transform: uppercase; margin-bottom: 8px;">Equipment List:</div>
			@foreach($equipments as $equipment)
				<div style="font-size: 14px; color: #1e293b; padding: 4px 0;">
					• <strong>{{ is_array($equipment) ? $equipment['name'] : $equipment->name }}</strong>
					<span style="color: #64748b;">({{ (is_array($equipment) ? $equipment['serial_no'] : $equipment->serial_no) ?? 'No S/N' }})</span>
				</div>
			@endforeach
		</div>

		<p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0;">
			Please return the equipment with all its cables and accessories on or before your target return time. If you already returned it, you can safely ignore this reminder.
		</p>
	</div>
</div>
