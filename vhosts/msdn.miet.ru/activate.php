<?
header('Content-Type: text/html; charset=utf-8');
?><!DOCTYPE html>
<html>
<head>
<title></title>
</head>
<body>
<style>
body {
	margin: 0;
	padding: 0;
	width: 100%;
	height: 100%;
}
div{
text-align: center;
position: absolute;
width: 100%;
top: 27%;
font-size: 20px;
}
span.red{
color: Red;
}
span.green{
color: Green;
}
</style>
<div>
<img src="MIEE1.gif"><br><br>
<?
ini_set('display_errors', 0);

function Securify($str)
	{
		$stru = strtoupper($str);
		$out = '';
		for($i = strlen($stru)-1; $i>=0; $i--)
		{
			if (strstr('QWERTYUIOPLKJHGFDSAZXCVBNM1234567890', $stru[$i]) !== false)
				$out = $str[$i].$out;
		}
		return $out;
	}
$str = Securify($_REQUEST['code']);

$link = odbc_connect('Driver=FreeTDS;TDS_Version = 7.0; Server=82.179.184.108; Port=1433; Database=Students;UID=checkgate;PWD=ik.pghjdthrb;','', '');

$res = odbc_do($link, "Select Numst, Code from [Students].[dbo].[Persons]
where code='$str'"
);
if ($item = odbc_fetch_array($res))
{
	odbc_free_result($res);
	if ($item['Code'] == $str && strlen($str)> 0)
		{

			$query = "Update Students.dbo.Persons set Code = 'done'  where (Code = '$str')";
			$res = odbc_do($link, $query);odbc_free_result($res);
			echo '<span class="green">Электронная почта успешно активирована</span>';
		}
	else
	{
		echo '<span class="red">Код активации неверен</span>';
		sleep(5);
	}
}
else
{
		echo '<span class="red">Код активации неверен</span>';
		sleep(5);
	}

odbc_close_all();
?>
</div>
</body>
</html>
