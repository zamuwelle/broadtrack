<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Borrowing Slip - {{ $booking->ticket_id }}</title>
    <style>
        @font-face { font-family: 'BroadTrack Arial'; src: url("{{ resource_path('fonts/Arial.ttf') }}") format('truetype'); font-weight: normal; }
        @font-face { font-family: 'BroadTrack Arial'; src: url("{{ resource_path('fonts/Arial-Bold.ttf') }}") format('truetype'); font-weight: bold; }
        @page { size: A4 portrait; margin: 32px; }
        body { font-family: 'BroadTrack Arial', sans-serif; font-size: 10px; color: #1e293b; }
        h1 { color: #0f4c81; font-size: 22px; margin: 0 0 5px; }
        h1 { margin-bottom: 18px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 7px; text-align: left; vertical-align: top; word-wrap: break-word; }
        .details th { width: 25%; color: #52647a; font-weight: bold; }
        .details td { width: 75%; color: #1e293b; }
        .details tr { border-bottom: 0.5px solid #e2e8f0; }
        .barcode { text-align: center; margin-top: 24px; }
        .barcode img { width: 220px; height: 36px; }
        .barcode p { margin: 5px 0 0; letter-spacing: 1px; }
        .note { margin: 10px 0; }
    </style>
</head>
<body>
    @php
        $isOverdue = $booking->isActive() && $booking->end_date?->isPast();
        $statusLabel = $isOverdue ? 'Overdue' : ucfirst($booking->status->value);
        $user = $booking->user;
    @endphp
    <h1>BroadTrack Borrowing Slip</h1>
    <table class="details">
        <tr><th>Ticket ID</th><td>{{ $booking->ticket_id }}</td></tr>
        <tr><th>Status</th><td>{{ $statusLabel }}</td></tr>
        <tr><th>Borrower</th><td>{{ $user?->full_name ?? 'N/A' }}</td></tr>
        <tr><th>Department</th><td>{{ $user?->department?->value ?? $user?->department ?? 'N/A' }}</td></tr>
        <tr><th>Email address</th><td>{{ $user?->email ?? 'N/A' }}</td></tr>
        <tr><th>Booked date</th><td>{{ $booking->start_date?->timezone('Asia/Manila')->format('M d, Y h:i A') ?? 'N/A' }}</td></tr>
        <tr><th>Due date</th><td>{{ $booking->end_date?->timezone('Asia/Manila')->format('M d, Y h:i A') ?? 'N/A' }}</td></tr>
        @if($booking->return_date)
            <tr><th>Return date</th><td>{{ $booking->return_date->timezone('Asia/Manila')->format('M d, Y h:i A') }}</td></tr>
            <tr><th>Returned to</th><td>{{ $booking->returnedByUser?->full_name ?? 'Custodian' }}</td></tr>
        @endif
        <tr><th>Purpose</th><td>{{ $booking->purpose ?: 'N/A' }}</td></tr>
        @forelse($booking->equipments as $item)
            <tr><th>Equipment</th><td>{{ $item->name }}@if($item->brand) ({{ $item->brand }})@endif</td></tr>
            <tr><th>Category</th><td>{{ $item->category?->value ?? $item->category }}</td></tr>
            <tr><th>Model</th><td>{{ $item->model ?? 'Standard' }}</td></tr>
            <tr><th>Serial number</th><td>{{ $item->serial_no ?? 'N/A' }}</td></tr>
        @empty
            <tr><th>Equipment</th><td>No equipment records found.</td></tr>
        @endforelse
    </table>
    @if($booking->approval_note)
        <p class="note"><strong>Note:</strong> {{ $booking->approval_note }}</p>
    @endif
    @if($booking->rejection_reason && $booking->status->value === 'rejected')
        <p class="note"><strong>Reason for rejection:</strong> {{ $booking->rejection_reason }}</p>
    @endif
    @if($isOverdue)
        <p class="note"><strong>Overdue:</strong> This item is past its due return date.</p>
    @endif
    <div class="barcode">
        <img src="data:image/svg+xml;base64,{{ base64_encode($barcode) }}" alt="Barcode for ticket {{ $booking->ticket_id }}">
        <p>*{{ $booking->ticket_id }}*</p>
    </div>
</body>
</html>
