<?php

require 'config.php';

$country = isset($_GET['country'])?$_GET['country']:'cs';
$name = isset($_GET['name'])?$_GET['name']:(isset($_POST['name'])?$_POST['name']:null);
$link = isset($_GET['link'])?$_GET['link']:(isset($_POST['link'])?$_POST['link']:null);
$shape = isset($_GET['shape'])?$_GET['shape']:(isset($_POST['shape'])?$_POST['shape']:1);
$region = isset($_GET['region'])?$_GET['region']:(isset($_POST['region'])?$_POST['region']:null);
$district = isset($_GET['district'])?$_GET['district']:(isset($_POST['district'])?$_POST['district']:null);
$attrs = isset($_GET['attrs'])?$_GET['attrs']:(isset($_POST['attrs'])?$_POST['attrs']:array());
$added_by = isset($_GET['added_by'])?$_GET['added_by']:(isset($_POST['added_by'])?$_POST['added_by']:null);
$add = isset($_POST['add'])?true:false;

if ($add) {
	if (empty($name) || empty($link) || empty($shape) || empty($region) || empty($district) || count($attrs) == 0 || empty($added_by)) {
		echo json_encode(array('error' => 1));
		exit;
	}
	else {
		//	add freedit to DB
		$data = array(
			'date' => Date('Y-m-d H:i:s'),
			'name' => $name,
			'district' => $district,
			'region' => $region,
			'state' => 'cs',	//	TODO: staty
			'added_by' => $added_by,
			'lon' => getLonFromUrl($link),
			'lat' => getLatFromUrl($link),
			'zoom' => getZoomFromUrl($link),
			'attr_g' => (isset($attrs['g'])?1:0),
			'attr_k' => (isset($attrs['k'])?1:0),
			'attr_o' => (isset($attrs['o'])?1:0),
			'attr_n' => (isset($attrs['n'])?1:0),
			'attr_a' => (isset($attrs['a'])?1:0),
			'shape' => $shape,
			'archive' => '0',
			'ip' => $ip
		);

		if (DB::vloz('freedit', $data)) {
			echo json_encode(array('error' => 0));
			exit;
		}
		else {
			echo json_encode(array('error' => 2));
			exit;
		}
	}
}

?>
<form id="add-new-freedit" method="post" action="<?=$url?>addFreedit.php">
	<table>
		<tr>
			<td>Název:</td>
			<td><input type="text" name="name" value="<?=$name?>" /></td>
		</tr>
		<tr>
			<td>Permalink:</td>
			<td><input type="text" name="link" value="<?=$link?>" /></td>
		</tr>
		<tr>
			<td>Tvar:</td>
			<td>
				<input type="radio" name="shape" value="1" id="add-freedit-shape-1"<?php if ($shape == 1) echo ' checked="checked"'; ?> /><label for="add-freedit-shape-1">1 - Obdelník na ležato (výřez z obrazovky)</label><br/>
				<input type="radio" name="shape" value="2" id="add-freedit-shape-2"<?php if ($shape == 2) echo ' checked="checked"'; ?> /><label for="add-freedit-shape-2">2 - Obdelník na stojato</label><br/>
				<input type="radio" name="shape" value="3" id="add-freedit-shape-3"<?php if ($shape == 3) echo ' checked="checked"'; ?> /><label for="add-freedit-shape-3">3 - Čtverec</label>
			</td>
		</tr>
		<tr>
			<td>Kraj:</td>
			<td><input type="text" name="region" value="<?=$region?>" /></td>
		</tr>
		<tr>
			<td>Okres:</td>
			<td><input type="text" name="district" value="<?=$district?>" /></td>
		</tr>
		<tr>
			<td>Co je potřeba udělat:</td>
			<td>
				<input type="checkbox" name="attrs[g]" value="1" id="add-freedit-attrs-g"<?php if (isset($attrs['g']) echo ' checked="checked"'; ?> /><label for="add-freedit-attrs-g">G - oprava geometrie</label><br/>
				<input type="checkbox" name="attrs[k]" value="1" id="add-freedit-attrs-k"<?php if (isset($attrs['k']) echo ' checked="checked"'; ?> /><label for="add-freedit-attrs-k">K - kreslit nové uličky / parkoviště</label><br/>
				<input type="checkbox" name="attrs[o]" value="1" id="add-freedit-attrs-o"<?php if (isset($attrs['o']) echo ' checked="checked"'; ?> /><label for="add-freedit-attrs-o">O - kontrola odbočení / jednosměrek</label><br/>
				<input type="checkbox" name="attrs[n]" value="1" id="add-freedit-attrs-n"<?php if (isset($attrs['n']) echo ' checked="checked"'; ?> /><label for="add-freedit-attrs-n">N - kontrola názvu ulic / obce</label><br/>
				<input type="checkbox" name="attrs[a]" value="1" id="add-freedit-attrs-a"<?php if (isset($attrs['a']) echo ' checked="checked"'; ?> /><label for="add-freedit-attrs-a">A - areál</label>
			</td>
		</tr>
		<tr>
			<td>Vložil:</td>
			<td><input type="hidden" name="added_by" value="<?=$added_by?>" /><?=$added_by?></td>
		</tr>
		<tr>
			<td>&nbsp;</td>
			<td><input type="hidden" name="add" value="1" /><button type="submit" name="add" value="1">Přidat</button><button type="button" name="" class="fe-close-modal-window">Zavřít</button></td>
		</tr>
	</table>
</form>