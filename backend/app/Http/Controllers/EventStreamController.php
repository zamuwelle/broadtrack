<?php

namespace App\Http\Controllers;

use Illuminate\Http\StreamedEvent;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Date;

class EventStreamController extends Controller
{
	public function stream()
	{
		return response()->eventStream(function () {
			while (ob_get_level()) ob_end_flush();
			@ini_set('output_buffering', 'off');
			set_time_limit(0);

			$known = DB::table('equipments')->pluck('status', 'id');

			while (true) {
				$current = DB::table('equipments')->pluck('status', 'id');

				if ($current != $known) {
					foreach ($current->diffAssoc($known) as $id => $status) {
						yield new StreamedEvent('equipment.status', ['id' => (int) $id, 'status' => $status]);
					}
					$known = $current;
				}

				yield new StreamedEvent('ping', Date::now()->toDateTimeString());

				sleep(3);
			}
		});
	}
}
