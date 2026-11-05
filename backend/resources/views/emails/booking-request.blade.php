@include('emails.partials.layout-start')
        <h2 style="font-size:20px; line-height:1.3; color:{{ config('theme.text') }}; margin:0 0 20px;">New equipment request</h2>
        <p style="font-size:15px; line-height:1.6; color:#475569; margin:0 0 20px;">
            A borrower has submitted an equipment request. Review the details below, then approve or reject the request in BroadTrack.
        </p>
        <div style="font-size:15px; line-height:1.6; color:#475569; margin-bottom:20px;">
            <div><strong style="color:#1e293b;">Borrower:</strong> {{ $borrowerName }}</div>
            <div><strong style="color:#1e293b;">Email:</strong> {{ $borrowerEmail }}</div>
            <div><strong style="color:#1e293b;">Purpose:</strong> {{ $purpose }}</div>
            <div><strong style="color:#1e293b;">Borrowing date:</strong> {{ $startDate }}</div>
            <div><strong style="color:#1e293b;">Return date:</strong> {{ $endDate }}</div>
            <div style="margin-top:8px;"><strong style="color:#1e293b;">Requested equipment:</strong></div>
            @foreach($items as $item)
                <div>• {{ $item['name'] }} · {{ $item['serial_no'] ?? 'No S/N' }} · Slip {{ $item['ticket_id'] }}</div>
            @endforeach
        </div>
        <div style="text-align:center; margin-bottom:24px;">
            <a href="{{ rtrim(config('app.frontend_url'), '/') }}/approvals" style="display:inline-block; background-color:{{ config('theme.primary') }}; color:{{ config('theme.surface') }}; text-decoration:none; font-size:16px; font-weight:600; padding:16px 32px; border-radius:8px;">Review request</a>
        </div>
@include('emails.partials.layout-end')
