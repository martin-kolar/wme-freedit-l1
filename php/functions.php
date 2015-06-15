<?php

function getLonFromUrl($url) {	//	return LON parameter from URL
	return getDataFromUrl($url, 'lon');
}

function getLatFromUrl($url) {	//	return LAT parameter from URL
	return getDataFromUrl($url, 'lat');
}

function getZoomFromUrl($url) {	//	return ZOOM parameter from URL
	return getDataFromUrl($url, 'zoom');
}

function getDataFromUrl($url, $name) {	//	return pasing data from URL
	$pos = strpos($url, $name . '=');

	if ($pos !== false) {
		$url = substr($url, $pos + strlen($name) + 1, strlen($url) - $pos);
		$len = strpos($url, '&');

		if ($len === false) {
			return $url;
		}
		else {
			return substr($url, 0, $len);
		}
	}
}

function parseImportDate($datetime) {
	$datetime = explode(" ", $datetime);

	$date = explode(".", $datetime[0]);
	$time = explode(":", $datetime[1]);

	if (count($date) > 1 && count($time) > 1) {	//	good data
		return Date("Y-m-d H:i:s", mktime($time[0], $time[1], $time[2], $date[1], $date[0], $date[2]));
	}
	else {	//	date without time
		return Date("Y-m-d H:i:s", mktime(0, 0, 0, $date[1], $date[0], $date[2]));
	}
}

function parseImportAttributes($attrs, $attr) {
	if (strpos($attrs, $attr) !== false) {
		return true;
	}
	else {
		return false;
	}
}

function parseImportComment($v, $start) {
	$comment = '';

	do {
		$comment .= $v[$start];
		$start++;
	} while (!empty($v[$start]));

	return $comment;
}

function getAttributesAsText($attr_g, $attr_k, $attr_o, $attr_n, $attr_a) {
	$returnText = '';

	if ($attr_g) {
		$returnText .= 'G ';
	}

	if ($attr_k) {
		$returnText .= 'K ';
	}

	if ($attr_o) {
		$returnText .= 'O ';
	}

	if ($attr_n) {
		$returnText .= 'N ';
	}

	if ($attr_a) {
		$returnText .= 'A ';
	}

	return substr($returnText, 0, strlen($returnText) - 1);
}

function returnActualFreeditState($editor, $controlor) {
	if ($editor['time'] > $controlor['time']) {
		return $editor['state'];
	}
	else {
		return $controlor['state'];
	}
}