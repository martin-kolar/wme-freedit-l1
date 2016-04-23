<?php

require 'config.php';

if (isset($_GET['file'])) {
	if (file_exists('import/freedit_' . $_GET['file']) && file_exists('import/editors_' . $_GET['file']) && file_exists('import/controlors_' . $_GET['file'])) {

		//	import freedit table

		$deleted = DB::dotaz('DELETE FROM `' . $dbPrefix . 'freedit`');
		echo 'Deleted freedit rows: ' . $deleted . '<br />';

		$import = file_get_contents('import/freedit_' . $_GET['file']);

		$import = explode("\n", $import);
		$i = 0;

		foreach ($import as $k => $v) {
			$v = explode(',', $v);

			if (!empty($v[1])) {
				$data = array(
					'id' => $v[1],
					'date' => parseImportDate($v[7]),
					'name' => $v[8],
					'district' => $v[9],
					'region' => $v[10],
					'added_by' => $v[11],
					'lon' => getLonFromUrl($v[14]),
					'lat' => getLatFromUrl($v[14]),
					'zoom' => getZoomFromUrl($v[14]),
					'attr_k' => parseImportAttributes($v[12], 'K'),
					'attr_g' => parseImportAttributes($v[12], 'G'),
					'attr_o' => parseImportAttributes($v[12], 'O'),
					'attr_n' => parseImportAttributes($v[12], 'N'),
					'attr_a' => parseImportAttributes($v[12], 'A'),
					'shape' => substr($v[13], 0, 1)
				);

				if (DB::vloz($dbPrefix . 'freedit', $data)) {
					$i++;
				}
				else {
					echo 'Data doesn\'t import: <pre>';
					print_r($v);
					echo '</pre><br />';
				}
			}
		}

		echo 'Insert ' . $i . ' freedit rows.<br />';

		//	import editors table

		$deleted = DB::dotaz('DELETE FROM `' . $dbPrefix . 'editors_insert`');
		echo 'Deleted editors rows: ' . $deleted . '<br />';
		$insertTable = array();

		$import = file_get_contents('import/editors_' . $_GET['file']);

		$import = explode("\n", $import);
		$i = 0;

		foreach ($import as $k => $v) {
			$v = explode(',', $v);

			if (!empty($v[1])) {
				$data = array(
					'freedit_id' => $v[0],
					'datetime' => parseImportDate($v[1]),
					'nick' => $v[2],
					'state' => substr($v[3], 0, 1),
					'comment' => parseImportComment($v, 4)
				);

				$insertTable[] = $data;

				if (DB::vloz($dbPrefix . 'editors_insert', $data)) {
					$i++;
				}
				else {
					echo 'Data doesn\'t import: <pre>';
					print_r($v);
					echo '</pre><br />';
				}
			}
		}

		echo 'Insert ' . $i . ' editors rows.<br />';

		//	import controlors table

		$deleted = DB::dotaz('DELETE FROM `' . $dbPrefix . 'controlors_insert`');
		echo 'Deleted controlors rows: ' . $deleted . '<br />';

		$import = file_get_contents('import/controlors_' . $_GET['file']);

		$import = explode("\n", $import);
		$i = 0;

		foreach ($import as $k => $v) {
			$v = explode(',', $v);

			if (!empty($v[1])) {
				$data = array(
					'freedit_id' => $v[0],
					'datetime' => parseImportDate($v[1]),
					'nick' => $v[2],
					'state' => substr($v[3], 0, 1),
					'comment' => parseImportComment($v, 4)
				);

				$insertTable[] = $data;

				if (DB::vloz($dbPrefix . 'controlors_insert', $data)) {
					$i++;
				}
				else {
					echo 'Data doesn\'t import: <pre>';
					print_r($v);
					echo '</pre><br />';
				}
			}
		}

		echo 'Insert ' . $i . ' controlors rows.<br />';

		//	load data into insert table

		$deleted = DB::dotaz('DELETE FROM `' . $dbPrefix . 'insert`');

		foreach ($insertTable as $v) {
			DB::vloz($dbPrefix . 'insert', $v);
		}
	}
}