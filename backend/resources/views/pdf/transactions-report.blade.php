<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Transactions Log</title>
    <style>
        @page {
            size: A4 landscape;
            margin: 20px 24px;
        }
        * {
            box-sizing: border-box;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 8.5px;
            color: #0f172a;
            line-height: 1.35;
            margin: 0;
            padding: 0;
            background: #ffffff;
        }
        .header-table {
            width: 100%;
            border-collapse: collapse;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 8px;
            margin-bottom: 12px;
        }
        .header-table td {
            vertical-align: bottom;
            padding: 0;
        }
        .doc-title {
            font-size: 16px;
            font-weight: 800;
            color: #0f172a;
            margin: 0;
        }
        .meta-text {
            text-align: right;
            font-size: 8.5px;
            color: #64748b;
        }
        .ledger-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 2px;
        }
        .ledger-table thead {
            display: table-header-group;
        }
        .ledger-table th {
            background-color: #f1f5f9;
            color: #334155;
            font-size: 8px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 6px 6px;
            text-align: left;
            border-top: 1px solid #cbd5e1;
            border-bottom: 1px solid #cbd5e1;
        }
        .ledger-table td {
            padding: 5px 6px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 8.5px;
            vertical-align: top;
        }
        .ledger-table tr:nth-child(even) td {
            background-color: #fafbfc;
        }
        .code-font {
            font-family: 'Courier New', Courier, monospace;
            font-size: 8.5px;
            color: #0f172a;
            font-weight: 700;
        }
        .sub-text {
            font-size: 7.5px;
            color: #64748b;
            margin-top: 1px;
        }
        .badge {
            display: inline-block;
            padding: 2px 5px;
            border-radius: 3px;
            font-size: 7.5px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.4px;
        }
        .badge-approved  { background-color: #e0f2fe; color: #0369a1; }
        .badge-released  { background-color: #e0e7ff; color: #3730a3; }
        .badge-returned  { background-color: #dcfce7; color: #15803d; }
        .badge-overdue   { background-color: #fee2e2; color: #b91c1c; border: 0.5px solid #fca5a5; }
        .badge-cancelled { background-color: #f1f5f9; color: #475569; }
        .badge-rejected  { background-color: #fff1f2; color: #be123c; }
        .report-footer {
            margin-top: 10px;
            border-top: 1px solid #e2e8f0;
            padding-top: 6px;
            font-size: 8px;
            color: #94a3b8;
            width: 100%;
        }
    </style>
</head>
<body>
    <table class="header-table">
        <tr>
            <td style="width: 60%;">
                <h1 class="doc-title">BroadTrack &bull; Transactions Log</h1>
            </td>
            <td style="width: 40%;" class="meta-text">
                <div>Export Date: <strong>{{ $generatedAt }}</strong></div>
                <div>Total Records: <strong>{{ count($rows) }} item(s)</strong></div>
            </td>
        </tr>
    </table>

    <table class="ledger-table">
        <thead>
            <tr>
                <th style="width: 11%;">Ticket ID</th>
                <th style="width: 23%;">Borrower Details</th>
                <th style="width: 22%;">Equipment & Serial</th>
                <th style="width: 19%;">Schedule</th>
                <th style="width: 16%;">Purpose</th>
                <th style="width: 9%;">Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($rows as $row)
            <tr>
                <td class="code-font">{{ $row['ticket_id'] }}</td>
                <td>
                    <div style="font-weight: 700; color: #0f172a; font-size: 9px;">{{ $row['borrower'] }}</div>
                    <div class="sub-text">{{ $row['email'] }} &bull; {{ $row['department_short'] ?: $row['department'] }}</div>
                </td>
                <td>
                    <div style="font-weight: 700; color: #0f172a; font-size: 9px;">{{ $row['equipment_name'] }}</div>
                    <div class="code-font" style="color: #0369a1;">{{ $row['serial_no'] }}</div>
                    <div class="sub-text">{{ $row['category'] }}{{ $row['model'] ? ' &bull; '.$row['model'] : '' }}</div>
                </td>
                <td>
                    <div><span style="color: #64748b;">Out:</span> {{ $row['borrow_date'] }}</div>
                    <div><span style="color: #64748b;">Due:</span> <strong>{{ $row['due_date'] }}</strong></div>
                    @if($row['actual_return_date'])
                        <div style="color: #15803d;"><span style="color: #64748b;">In:</span> {{ $row['actual_return_date'] }}</div>
                    @endif
                </td>
                <td style="color: #334155;">{{ $row['purpose'] }}</td>
                <td>
                    <span class="badge badge-{{ strtolower($row['status_key']) }}">
                        {{ $row['status_label'] }}
                    </span>
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="6" style="text-align: center; padding: 24px; color: #94a3b8;">
                    No transactions found.
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <table class="report-footer">
        <tr>
            <td style="width: 50%;">
                BroadTrack
            </td>
            <td style="width: 50%; text-align: right;">
                Showing {{ count($rows) }} record{{ count($rows) === 1 ? '' : 's' }}
            </td>
        </tr>
    </table>
</body>
</html>
