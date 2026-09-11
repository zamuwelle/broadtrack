<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Borrowing Slip - {{ $booking->ticket_id }}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 28px 32px;
        }
        * {
            box-sizing: border-box;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 10px;
            color: #0f172a;
            line-height: 1.45;
            margin: 0;
            padding: 0;
            background: #ffffff;
        }
        .header-table {
            width: 100%;
            border-collapse: collapse;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 12px;
            margin-bottom: 16px;
        }
        .header-table td {
            vertical-align: bottom;
            padding: 0;
        }
        .doc-title {
            font-size: 18px;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: -0.3px;
            margin: 0;
        }
        .inst-name {
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #64748b;
            margin-bottom: 3px;
        }
        .ticket-box {
            text-align: right;
        }
        .ticket-label {
            font-size: 8px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #64748b;
        }
        .ticket-id {
            font-family: 'Courier New', Courier, monospace;
            font-size: 16px;
            font-weight: 700;
            color: #0f172a;
            letter-spacing: 0.5px;
            margin: 2px 0 4px 0;
        }
        .status-badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.4px;
        }
        .badge-approved { background-color: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }
        .badge-returned { background-color: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
        .badge-overdue  { background-color: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }
        .badge-cancelled{ background-color: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
        .badge-rejected { background-color: #fff1f2; color: #be123c; border: 1px solid #fecdd3; }
        .barcode-section {
            width: 100%;
            text-align: center;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 10px 14px 8px 14px;
            margin-bottom: 16px;
        }
        .barcode-bars {
            height: 32px;
            margin: 0 auto 3px auto;
            text-align: center;
        }
        .barcode-code {
            font-family: 'Courier New', Courier, monospace;
            font-size: 10px;
            letter-spacing: 3px;
            color: #334155;
            font-weight: 600;
        }
        .grid-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 12px 0;
            margin-left: -12px;
            margin-right: -12px;
            margin-bottom: 16px;
        }
        .grid-table td {
            vertical-align: top;
            width: 50%;
            padding: 0;
        }
        .card {
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px 14px;
        }
        .card-heading {
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #0284c7;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 6px;
            margin: 0 0 8px 0;
        }
        .detail-row {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 4px;
        }
        .detail-row td {
            padding: 2.5px 0;
            font-size: 9.5px;
        }
        .detail-label {
            width: 38%;
            color: #64748b;
            font-weight: 500;
        }
        .detail-value {
            width: 62%;
            color: #0f172a;
            font-weight: 600;
        }
        .section-header {
            font-size: 9.5px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #334155;
            margin: 16px 0 6px 0;
        }
        .manifest-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 4px;
            margin-bottom: 14px;
        }
        .manifest-table th {
            background-color: #f8fafc;
            color: #475569;
            font-size: 8.5px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 6px 8px;
            text-align: left;
            border-top: 1px solid #cbd5e1;
            border-bottom: 1px solid #cbd5e1;
        }
        .manifest-table td {
            padding: 6px 8px;
            border-bottom: 1px solid #f1f5f9;
            font-size: 9.5px;
            vertical-align: middle;
        }
        .manifest-table tr:last-child td {
            border-bottom: 1px solid #cbd5e1;
        }
        .code-font {
            font-family: 'Courier New', Courier, monospace;
            font-size: 9px;
            color: #1e293b;
        }
        .notice-box {
            border-radius: 4px;
            padding: 8px 12px;
            font-size: 9px;
            margin-top: 8px;
            margin-bottom: 14px;
        }
        .notice-returned {
            background-color: #f0fdf4;
            border: 1px solid #bbf7d0;
            color: #166534;
        }
        .notice-overdue {
            background-color: #fef2f2;
            border: 1px solid #fecaca;
            color: #991b1b;
        }
        .notice-refusal {
            background-color: #fff1f2;
            border: 1px solid #fecdd3;
            color: #9f1239;
        }
        .footer-table {
            width: 100%;
            border-collapse: collapse;
            border-top: 1px solid #e2e8f0;
            padding-top: 10px;
            margin-top: 24px;
        }
        .footer-table td {
            font-size: 8.5px;
            color: #94a3b8;
            padding: 0;
            vertical-align: top;
        }
    </style>
</head>
<body>
    @php
        $isOverdue = $booking->isActive() && $booking->end_date?->isPast();
        $statusKey = $isOverdue ? 'overdue' : strtolower($booking->status->value);
        $statusLabel = $isOverdue ? 'Overdue' : strtoupper($booking->status->value);
        $user = $booking->user;
    @endphp

    <table class="header-table">
        <tr>
            <td style="width: 60%;">
                <div class="inst-name">BroadTrack</div>
                <h1 class="doc-title">Borrowing Slip</h1>
            </td>
            <td style="width: 40%;" class="ticket-box">
                <div class="ticket-label">Ticket Reference</div>
                <div class="ticket-id">{{ $booking->ticket_id }}</div>
                <span class="status-badge badge-{{ $statusKey }}">{{ $statusLabel }}</span>
            </td>
        </tr>
    </table>

    <div class="barcode-section">
        <div class="barcode-bars">
            <svg width="240" height="30" viewBox="0 0 240 30" style="display: inline-block;">
                <defs>
                    <pattern id="barcode-stripes" width="8" height="30" patternUnits="userSpaceOnUse">
                        <rect x="0" y="0" width="2" height="30" fill="#0f172a" />
                        <rect x="3" y="0" width="1" height="30" fill="#0f172a" />
                        <rect x="5" y="0" width="3" height="30" fill="#0f172a" />
                    </pattern>
                </defs>
                <rect x="0" y="0" width="240" height="30" fill="url(#barcode-stripes)" />
            </svg>
        </div>
        <div class="barcode-code">*{{ $booking->ticket_id }}*</div>
    </div>

    <table class="grid-table">
        <tr>
            <td>
                <div class="card">
                    <div class="card-heading">Borrower Information</div>
                    <table class="detail-row">
                        <tr>
                            <td class="detail-label">Full Name:</td>
                            <td class="detail-value">{{ $user?->full_name ?? 'N/A' }}</td>
                        </tr>
                        <tr>
                            <td class="detail-label">Department:</td>
                            <td class="detail-value">{{ $user?->department?->value ?? $user?->department ?? 'N/A' }}</td>
                        </tr>
                        <tr>
                            <td class="detail-label">Email:</td>
                            <td class="detail-value">{{ $user?->email ?? 'N/A' }}</td>
                        </tr>
                        <tr>
                        </tr>
                    </table>
                </div>
            </td>
            <td>
                <div class="card">
                    <div class="card-heading">Schedule & Details</div>
                    <table class="detail-row">
                        <tr>
                            <td class="detail-label">Borrow Date:</td>
                            <td class="detail-value">{{ $booking->start_date ? $booking->start_date->timezone('Asia/Manila')->format('M d, Y h:i A') : 'N/A' }}</td>
                        </tr>
                        <tr>
                            <td class="detail-label">Due Return:</td>
                            <td class="detail-value">{{ $booking->end_date ? $booking->end_date->timezone('Asia/Manila')->format('M d, Y h:i A') : 'N/A' }}</td>
                        </tr>
                        @if($booking->return_date)
                        <tr>
                            <td class="detail-label">Actual Return:</td>
                            <td class="detail-value" style="color: #166534;">
                                {{ $booking->return_date->timezone('Asia/Manila')->format('M d, Y h:i A') }}
                            </td>
                        </tr>
                        @endif
                        <tr>
                            <td class="detail-label">Purpose:</td>
                            <td class="detail-value">{{ $booking->purpose ?: 'N/A' }}</td>
                        </tr>
                    </table>
                </div>
            </td>
        </tr>
    </table>

    @if($booking->approval_note)
    <div style="background: #f8fafc; border-left: 3px solid #0284c7; padding: 6px 10px; margin-bottom: 12px; font-size: 9px;">
        <strong style="color: #0369a1;">Note:</strong> {{ $booking->approval_note }}
    </div>
    @endif

    @if($booking->rejection_reason && $booking->status->value === 'rejected')
    <div class="notice-box notice-refusal">
        <strong>Declined:</strong> {{ $booking->rejection_reason }}
    </div>
    @endif

    @if($booking->status->value === 'returned')
    <div class="notice-box notice-returned">
        <strong>Returned:</strong> Checked in by {{ $booking->returnedByUser?->full_name ?? 'Custodian' }} on {{ $booking->return_date?->timezone('Asia/Manila')->format('M d, Y \a\t h:i A') }}.
    </div>
    @elseif($isOverdue)
    <div class="notice-box notice-overdue">
        <strong>Overdue:</strong> This item is past its due return date.
    </div>
    @endif

    <div class="section-header">Equipment ({{ count($booking->equipments) }} item{{ count($booking->equipments) === 1 ? '' : 's' }})</div>
    <table class="manifest-table">
        <thead>
            <tr>
                <th style="width: 6%;">#</th>
                <th style="width: 38%;">Equipment Item</th>
                <th style="width: 18%;">Category</th>
                <th style="width: 18%;">Model</th>
                <th style="width: 20%;">Serial No.</th>
            </tr>
        </thead>
        <tbody>
            @forelse($booking->equipments as $index => $item)
            <tr>
                <td style="color: #64748b;">{{ sprintf('%02d', $index + 1) }}</td>
                <td style="font-weight: 600; color: #0f172a;">
                    {{ $item->name }}
                    @if($item->brand)
                        <span style="font-weight: 400; color: #64748b;">({{ $item->brand }})</span>
                    @endif
                </td>
                <td>{{ $item->category?->value ?? $item->category }}</td>
                <td style="color: #475569;">{{ $item->model ?? 'Standard' }}</td>
                <td class="code-font">{{ $item->serial_no ?? 'N/A' }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="5" style="text-align: center; color: #94a3b8; padding: 12px;">No equipment records found.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <table class="footer-table">
        <tr>
            <td style="width: 50%;">BroadTrack &bull; Ticket #{{ $booking->ticket_id }}</td>
            <td style="width: 50%; text-align: right;">Generated: {{ now()->timezone('Asia/Manila')->format('M d, Y h:i A') }}</td>
        </tr>
    </table>
</body>
</html>
