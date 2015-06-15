<?php

// Wrapper pro snadnější práci s databází s použitím PDO a automatickýmail
// zabezpečením parametrů (proměnných) v dotazech.

class DB {
	// Databázové spojení
	private static $spojeni;

	// Výchozí nastavení ovladače
	private static $nastaveni = Array(
		PDO::ATTR_ERRMODE => PDO::ERRMODE_WARNING,
		PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"
	);

	// Připojí se k databázi pomocí daných údajů
	public static function pripoj($host, $uzivatel, $heslo, $databaze) {
		if (!isset(self::$spojeni)) {
			self::$spojeni = @new PDO(
				"mysql:host=$host;dbname=$databaze",
				$uzivatel,
				$heslo,
				self::$nastaveni
			);
		}
	}

	// Spustí dotaz a vrátí z něj první řádek
	public static function dotazJeden($dotaz, $parametry = Array()) {
		$navrat = self::$spojeni->prepare($dotaz);
		$navrat->execute($parametry);
		return $navrat->fetch();
	}

	// Spustí dotaz a vrátí všechny jeho řádky jako pole asociativních polí
	public static function dotazVsechny($dotaz, $parametry = Array()) {
		$navrat = self::$spojeni->prepare($dotaz);
		$navrat->execute($parametry);
		return $navrat->fetchAll();
	}

	// Spustí dotaz a vrátí z něj první sloupec prvního řádku
	public static function dotazSamotny($dotaz, $parametry = Array()) {
		$vysledek = self::dotazJeden($dotaz, $parametry);
		return $vysledek[0];
	}

	// Spustí dotaz a vrátí počet ovlivněných řádků
	public static function dotaz($dotaz, $parametry = Array()) {
		$navrat = self::$spojeni->prepare($dotaz);
		$navrat->execute($parametry);
		return $navrat->rowCount();
	}

	// Umožňuje snadné vložení záznamu do databáze pomocí asociativního pole
	public static function vloz($tabulka, $parametry = Array()) {
		return self::dotaz("INSERT INTO `$tabulka` (`".
			implode('`, `', array_keys($parametry)).
			"`) VALUES (".str_repeat('?,', sizeOf($parametry)-1)."?)",
				array_values($parametry));
	}

	// Umožňuje snadnou modifikaci záznamu v databázi pomocí asociativního pole
	public static function zmen($tabulka, $hodnoty = Array(), $podminka, $parametry = Array()) {
		return self::dotaz("UPDATE `$tabulka` SET `".
			implode('` = ?, `', array_keys($hodnoty)).
			"` = ? " . $podminka,
			array_merge(array_values($hodnoty), $parametry));
	}
}