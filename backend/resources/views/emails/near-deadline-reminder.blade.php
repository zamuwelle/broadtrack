@include('emails.partials.layout-start')
        <h2 style="font-size:20px; line-height:1.3; color:{{ config('theme.text') }}; margin:0 0 20px;">Equipment Due Soon</h2>
        <p style="font-size:15px; line-height:1.6; color:#475569; margin:0 0 20px;">
            Hi {{ $firstname }},<br><br>The equipment listed below is due for return on {{ $dueDate }}. Please return all listed items by then.
        </p>
        <div style="font-size:15px; line-height:1.6; color:#475569; margin-bottom:20px;">
            <div><strong style="color:#1e293b;">Slip:</strong> {{ $ticketId }}</div>
            <div style="margin-top:8px;"><strong style="color:#1e293b;">Equipment:</strong></div>
            @foreach($equipments as $equipment)
                <div>• {{ is_array($equipment) ? $equipment['name'] : $equipment->name }} ({{ (is_array($equipment) ? $equipment['serial_no'] : $equipment->serial_no) ?? 'No S/N' }})</div>
            @endforeach
        </div>
        <p style="font-size:15px; line-height:1.6; color:#475569; margin:0;">
            If you've already returned the equipment, you can ignore this reminder. If you need help, please contact the administrator.
        </p>
@include('emails.partials.layout-end')
