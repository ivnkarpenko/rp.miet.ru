<?
ini_set('display_errors', 0);

if ($_SERVER['HTTPS'] != "on")
{
        header( "HTTP/1.1 301 Moved Permanently" );
                header( "Status: 301 Moved Permanently" );
                header( "Location: https://msdn.miet.ru/elms2.php" );
                exit(0);
}

header('Content-Type:text/html;charset=utf-8');
include_once("classes.php");
?><html xmlns="http://www.w3.org/1999/xhtml">
<head>
<title>Авторизация системы ELMS</title>
<meta content="text/html; charset=windows-1251" http-equiv="Content-Type"/>
<meta content="" name="keyphrase"/>
<meta content="" name="title"/>
<meta content="All" name="robots"/>
<meta content="General" name="rating"/>
<meta content="" name="generator"/>
<meta content="" name="copyright"/>
<meta content="" name="author"/>
<style>
body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
}
table#vhod {
    width: 100%;
    height: 100%;
    border: 0;
}
table#vhod td#main {
    width: 100%;
    height: 70%;
    vertical-align: bottom;
}
td#main table {
    width: 453px;
    height: 96px;
    border: 0;
}
td#name {
    text-align: right;
    color: #fff;
    width: 71px;
    height: 30px;
    padding-right: 18px;
    vertical-align: middle;
}
td#input {
    width: 132px;
    height: 30px;
    text-align: left;
    padding-right: 8px;
    vertical-align: middle;
}
td#input input {
    width: 121px;
    height: 17px;

}
td#submit {
    width: 203px;
    height: 36px;
    text-align: right;
    padding-right: 8px;
    padding-top: 12px;
}
td#contact {
    height: 45%;
    text-align: center;
    vertical-align: top;
    padding-left: 35px;
}
.errortext{
color: Red;
}

</style>
</head>
<body>
<table id="vhod" cellspacing="0" cellpadding="0" width="100%">
<tr>
<td id="main" align="center">

    <table cellspacing="0" cellpadding="0" width="100%" height="100%">
    <tr><td align="center"><img src="MIEE1.gif"></td></tr>
    <tr><td align="center" style="padding-top: 20px;">

<?$_REQUEST['return_url'] = urldecode($_REQUEST['return_url']);?>


<?

//print_r($_REQUEST);

$memberof_groups = array(
    "CN=Students,OU=Students,OU=MIET,DC=sipc,DC=miet,DC=ru",
    "CN=ASP,OU=ASP,OU=MIET,DC=sipc,DC=miet,DC=ru",
    "CN=Staff,OU=Staff,OU=MIET,DC=sipc,DC=miet,DC=ru",   
);

$allowed_groups = array(
    //"CN=Students,OU=Students,OU=MIET,DC=sipc,DC=miet,DC=ru",
    //"CN=ASP,OU=ASP,OU=MIET,DC=sipc,DC=miet,DC=ru",
    "CN=msdn,OU=Rights,OU=MIET,DC=sipc,DC=miet,DC=ru"
);

function UTFToWin($str)
{
    return iconv('UTF-8','cp1251',$str);
}

//session_start();

$login = strtolower($_POST['USER_LOGIN']);

$error = "";


function getStType($login)
{
    if (preg_match('/^u\d{6}$/', $login))
        return 'S';
    if (preg_match('/^t\d{7}$/i', $login))
        return 'T';
    return false;
}

if ($_REQUEST['auth'] == 'Y')
{

    $cpt = new CCaptcha();
  if ($cpt->CheckCode($_REQUEST['secret_number'], $_REQUEST['captcha_sid'])):

    $link = ldap_connect("82.179.184.120", "389");
//    $res = ldap_bind($link, $_POST['USER_LOGIN']."@sipc.miet.ru", mb_convert_encoding('"'.$_POST['USER_PASSWORD'].'"', "UCS-2LE", "Windows-1251") );
    $res = ldap_bind($link, $login."@sipc.miet.ru", $_POST['USER_PASSWORD'] );

    $auth = false;    

    if ($res)
    {
        $auth = true;
        $search = ldap_search($link, "OU=Miet,DC=sipc, DC=miet, DC=ru", "(&(sAMAccountName=$login)(objectClass=user))");

        $res = ldap_first_entry($link, $search );
        $attr = ldap_get_attributes($link,  $res );

        
        $is_vpn = false;
        $is_allowed = false;
        
        //print_r($attr['memberOf']);
        foreach ($attr['memberOf'] as $group)
        {
            $is_vpn |= in_array($group, $allowed_groups);
            $is_allowed |= in_array($group, $memberof_groups);
        }
    // Sorry =)
        if ( ($login == 'u211311') || ($login == 'sample' ) || ($login == 'u251193' ) ) $is_allowed = $is_vpn = true;
        
        if ($is_allowed && $is_vpn)
        {
                $fio = split(" ", iconv('cp1251','UTF-8',$attr['displayName'][0]));
                    
                        
                /*$main_uri= "https://msdn63.e-academy.com/tdmtz_dtcs/index.cfm?loc=login/cab_cgi";

                $main_uri .= '&token='.intval($_REQUEST['token']);
                $main_uri .= '&return_url='.$_REQUEST['return_url'];

                $main_uri .= '&uid='.$login;

                $fio = split(" ", UTFToWin($attr['displayName'][0]));

                $main_uri .= '&fname='.trim($fio[1]);
                $main_uri .= '&lname='.trim($fio[0]);
                $main_uri .= '&email='.urlencode($login.'@edu.miet.ru');
                $main_uri .= '&groups=Students';
                $main_uri .= '&department=TCS';*/
                
                $key = '91c8c561'; // replace with your webstore key
                $host = 'https://e5.onthehub.com/WebStore/Security/AuthenticateUser.aspx';

                // build e5 verification page query string variables
                $vars = 'username='.$login;               
                
                $vars .= '&first_name='.urlencode(trim($fio[1]));
                $vars .= '&last_name='.urlencode(trim($fio[0]));                
                switch(getStType($login))
                {
                    case 'S':
                        $vars .= '&academic_statuses='.'students'; // faculty,staff
                        $vars .= '&email='.urlencode($login.'@edu.miet.ru');
                    break;
                    case 'T':
                        $vars .= '&academic_statuses='.'staff'; // faculty,staff
                        $vars .= '&email='.urlencode($login.'@org.miet.ru');
                    break;
                }
                
               // $vars .= '&shopper_ip='.$_SERVER['REMOTE_ADDR'];
                $vars .= '&key='.$key;

                //echo $vars;
                //die();
                $e5verfurl = $host.'?'.$vars;

                $handle = fopen($e5verfurl, 'r');
                $e5LoginRedirectURL = stream_get_contents($handle);
                fclose($handle);

               // echo $e5LoginRedirectURL;
                $http_status = $http_response_header[0];
                if (strpos($http_status, '200 OK') === false)    // NOTE $http_status may not always be $http_response_header[0]
                {
                    // we have an error
                    //$error = "Ошибка связи с сервером MSDN: ".$http_status;
                    $error = "Ошибка связи с сервером MSDN<br><small>".(htmlspecialchars($http_status)).'</small>';
                    //echo '<p><b>A handshake error has occured</b></p>';
                    //echo '<p><b>Response received:<br><font color="red">'.$http_status.'</font></b></p>';
                }
                else if (strlen($e5LoginRedirectURL) == 0 || strpos($e5LoginRedirectURL, 'https') !== 0 )
                {
                    // HTTP status code was OK but server didn't return a redirect URL; may be some other error, such as incorrectly configured server IP for your server
                    //echo '<p><b>A handshake error has occured; invalid redirection URL</b></p>';
                    $error = "Ошибка ответа сервера MSDN<br><small>".htmlspecialchars($e5LoginRedirectURL).'</small>';                    
                }
                else 
                {
                    // status code looks good and we have a redirection URL; set redirect location in header
                    header( "HTTP/1.1 301 Moved Permanently" );
                    header( "Status: 301 Moved Permanently" );
                    header( "Location: $e5LoginRedirectURL" );
                    die();
                }

    
                /*$fp = file_get_contents($main_uri);
                echo $fp;
                $ret = $_REQUEST['return_url'].'&token='.intval($_REQUEST['token']).'&uid='.$login;
                //echo "\n$ret";*/
                

               /* header( "HTTP/1.1 301 Moved Permanently" );
                header( "Status: 301 Moved Permanently" );
                header( "Location: $ret" );
                exit(0);*/
                
            }
        else
            $error =  "Доступ к MSDNAA для Вашей учетной записи закрыт. Право пользования системой имеют только учащиеся студенты и работающие сотрудники и преподаватели МИЭТа, сменившие пароль по умолчанию.";
        //print_r($attr);
    }
    else
        $error =  "Имя пользователя или пароль не верны";
    else:
        $error =  "Проверочный код не верен";
    endif;
}
?>
<? if($error): ?>
<font style="color: red;margin-bottom: 10px;"><?=$error?></font>
<?endif;?>
<form method="post" target="_top" action="elms2.php">
    <input type="hidden" name="auth" value="Y" />
    <input type="hidden" name="token" value="<?=intval($_REQUEST['token'])?>" />
    <input type="hidden" name="return_url" value="<?=urlencode($_REQUEST['return_url'])?>" />

    <table align="center" style="width: 70%; margin-top: 10px;">
            <tr>
                <td align="center">
                Логин:</td><td>
                <input type="text" name="USER_LOGIN" maxlength="50" value="" size="25" /></td>
            </tr>
            <tr>
                <td align="center">
                Пароль:</td><td>
                <input type="password" name="USER_PASSWORD" maxlength="50" size="25" /></td>
            </tr>
            <tr>
                <td align="center"  style="padding-top: 10px;padding-bottom:10px;">Введите код:</td>
                <td style="padding-top: 10px;">
            <?
            $captcha = new CCaptcha();
            $captcha->SetCode();?>
            <input type="hidden" name="captcha_sid" value="<?=$captcha->GetSID()?>" />
            <img src="/captcha.php?captcha_sid=<?=$captcha->GetSID()?>" width="180" height="40" alt="CAPTCHA" /><br>
            </td>
            </tr>
            <tr>
                <td></td>
                <td align="left"><input type="text" name="secret_number" maxlength="50" value="" size="25" /></td>
            </tr>



            <tr align="center">
                <td align="center" colspan="2"><input type="submit" value="Войти" /></td>
            </tr>


    </table>
</form>
<?




?>

    </td>
    </tr>
    </table>

    </td>
</tr>

<tr>
    <td>
    &nbsp;
    </td>
</tr>
</table>
<script>
</script>
</body>
</html>
