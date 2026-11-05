<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>BroadTrack Transactions</title>
    <style>
        @font-face { font-family: 'BroadTrack Arial'; src: url("{{ resource_path('fonts/Arial.ttf') }}") format('truetype'); font-weight: normal; }
        @font-face { font-family: 'BroadTrack Arial'; src: url("{{ resource_path('fonts/Arial-Bold.ttf') }}") format('truetype'); font-weight: bold; }
        @page { size: A3 landscape; margin: 24px; }
        body { font-family: 'BroadTrack Arial', sans-serif; color: #1e293b; font-size: 8px; }
        .brand { border-collapse: collapse; margin-bottom: 14px; }
        .brand td { vertical-align: middle; }
        .brand h1 { color: #0f4c81; font-size: 18px; margin: 0; }
        .transactions { width: 100%; border-collapse: collapse; table-layout: auto; }
        .transactions thead { display: table-header-group; }
        .transactions tr { page-break-inside: avoid; }
        .transactions th { background: #0f4c81; color: #fff; font-weight: bold; text-align: left; }
        .transactions th, .transactions td { border: 0.5px solid #000; padding: 6px 3px; text-align: left; vertical-align: top; overflow-wrap: break-word; word-wrap: break-word; }
        .transactions .purpose { max-width: 220px; }
        .transactions .date { white-space: nowrap; }
        .transactions tbody tr:nth-child(even) { background: #eef5fa; }
    </style>
</head>
<body>
    <table class="brand"><tr>
        <td><h1>BroadTrack Transactions</h1></td>
    </tr></table>
    <table class="transactions">
        <thead><tr>
            @foreach(['Ticket ID', 'Borrower Full Name', 'Email Address', 'Department', 'Equipment Name', 'Category', 'Model', 'Serial Number', 'Booked Date', 'Due Date', 'Return Date', 'Purpose', 'Status'] as $heading)
                <th class="{{ $heading === 'Purpose' ? 'purpose' : '' }}">{{ $heading }}</th>
            @endforeach
        </tr></thead>
        <tbody>
            @forelse($rows as $row)
                <tr>
                    @foreach(['ticket_id', 'borrower', 'email', 'department', 'equipment_name', 'category', 'model', 'serial_no', 'borrow_date', 'due_date', 'actual_return_date', 'purpose', 'status_label'] as $key)
                        <td class="{{ $key === 'purpose' ? 'purpose' : (in_array($key, ['borrow_date', 'due_date', 'actual_return_date'], true) ? 'date' : '') }}">{{ ($row[$key] ?? '') === 'N/A' ? '' : ($row[$key] ?? '') }}</td>
                    @endforeach
                </tr>
            @empty
                <tr><td colspan="13" style="text-align: center; padding: 16px;">No transactions found.</td></tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>
