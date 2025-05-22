<?
$gmt_mtime = gmdate('D, d M Y H:i:s', time() ) . ' GMT';
    header("Last-Modified: " . $gmt_mtime );
    header("Cache-Control: max-age=3600, must-revalidate");
  $offset = 3600 * 24;    
  $expire = "Expires: " . gmdate("D, d M Y H:i:s", time() + $offset) . " GMT";
  Header($expire);
  header("Pragma: public");     
  
header("Content-Type: text/html; charset=utf8");
error_reporting(E_ERROR);
ini_set('display_errors', 0);
///print_r($_SERVER);
$arr = array('82.179.184.1','82.179.184.2'/*, '82.179.184.125'*/ );
if ((array_search($_SERVER["HTTP_X_FORWARDED_FOR"] , $arr)  !== false) || (array_search($_SERVER["REMOTE_ADDR"] , $arr)  !== false)):
echo file_get_contents('./keyboard.js');
endif;
?>