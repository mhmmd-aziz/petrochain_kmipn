<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Transaksi BBM Bersubsidi</title>
    <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 12px; color: #333; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .header h1 { margin: 0; font-size: 18px; text-transform: uppercase; }
        .header p { margin: 5px 0 0 0; font-size: 12px; color: #666; }
        .meta { margin-bottom: 20px; font-size: 12px; }
        .meta table { width: 100%; }
        .meta td { padding: 3px 0; }
        table.data { width: 100%; border-collapse: collapse; margin-top: 10px; }
        table.data th, table.data td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        table.data th { background-color: #f4f4f4; font-weight: bold; }
        .footer { position: fixed; bottom: -20px; left: 0px; right: 0px; height: 30px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #ddd; padding-top: 10px; }
        .status-valid { color: #166534; font-weight: bold; }
        .status-review { color: #854d0e; font-weight: bold; }
        .status-rejected { color: #991b1b; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Laporan Penyaluran BBM Bersubsidi</h1>
        <p>Sistem Pengawasan Distribusi PETROCHAIN</p>
    </div>

    <div class="meta">
        <table>
            <tr>
                <td width="20%"><strong>Dicetak Oleh</strong></td>
                <td width="80%">: {{ $user->name }} ({{ strtoupper($user->role) }})</td>
            </tr>
            <tr>
                <td><strong>Waktu Cetak</strong></td>
                <td>: {{ \Carbon\Carbon::now()->format('d/m/Y H:i:s') }}</td>
            </tr>
            @if($filters['start_date'] || $filters['end_date'])
            <tr>
                <td><strong>Periode</strong></td>
                <td>: {{ $filters['start_date'] ?? 'Awal' }} s/d {{ $filters['end_date'] ?? 'Sekarang' }}</td>
            </tr>
            @endif
            @if($filters['status'])
            <tr>
                <td><strong>Status</strong></td>
                <td>: {{ strtoupper($filters['status']) }}</td>
            </tr>
            @endif
        </table>
    </div>

    <table class="data">
        <thead>
            <tr>
                <th>No</th>
                <th>Waktu Transaksi</th>
                <th>Lokasi SPBU</th>
                <th>Plat Nomor</th>
                <th>Jenis BBM</th>
                <th>Volume (L)</th>
                <th>Status Audit</th>
            </tr>
        </thead>
        <tbody>
            @forelse($transactions as $index => $trx)
            <tr>
                <td style="text-align: center;">{{ $index + 1 }}</td>
                <td>{{ \Carbon\Carbon::parse($trx->transacted_at)->format('d/m/Y H:i') }}</td>
                <td>{{ $trx->spbu->name ?? '-' }}</td>
                <td><strong>{{ $trx->vehicle->plate_number ?? '-' }}</strong></td>
                <td>{{ strtoupper($trx->fuel_type) }}</td>
                <td>{{ $trx->volume }}</td>
                <td>
                    @if($trx->transaction_status == 'validated')
                        <span class="status-valid">VALID</span>
                    @elseif(in_array($trx->transaction_status, ['rejected', 'failed']))
                        <span class="status-rejected">DITOLAK</span>
                    @else
                        <span class="status-review">REVIEW</span>
                    @endif
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="7" style="text-align: center; padding: 20px;">Tidak ada data transaksi pada periode ini.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        PETROCHAIN &copy; {{ date('Y') }} - Dokumen ini di-generate secara otomatis dan sah.
    </div>
</body>
</html>
