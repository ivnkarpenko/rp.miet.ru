<?
function getmicrotime()
{
    list($usec, $sec) = explode(" ", microtime());
    return ((float)$usec + (float)$sec);
}
    function GetPHPCPUMark()
    {
        $res = array();
        for($j = 0; $j < 4; $j++)
        {
            $N1 = 0;
            $N2 = 0;

            $s1 = getmicrotime();
            for($i = 0; $i < 1000000; $i++)
            {
            }
            $e1 = getmicrotime();
            $N1 = $e1 - $s1;

            $s2 = getmicrotime();
            for($i = 0; $i < 1000000; $i++)
            {
                //This is one op
                $k++;$k--;
                $k++;$k--;
            }
            $e2 = getmicrotime();
            $N2 = $e2 - $s2;


            if($N2 > $N1)
                $res[] = 1 / ($N2 - $N1);
        }

        if(count($res))
            return array_sum($res)/doubleval(count($res));
        else
            return 0;
    }
    
function GetDBMark($type)
    {
        global $DB;

        $res = array();
        switch($type)
        {
        case "read":
            $strSql = "select * from b_perf_test WHERE ID = #i#";
            $bFetch = true;
            break;
        case "update":
            $strSql = "update b_perf_test set REFERENCE_ID = ID+1, NAME = '".str_repeat("y", 200)."' WHERE ID = #i#";
            $bFetch = false;
            break;
        default:
            $DB->Query("truncate table b_perf_test");
            $strSql = "insert into b_perf_test (REFERENCE_ID, NAME) values (#i#-1, '".str_repeat("x", 200)."')";
            $bFetch = false;
        }

        for($j = 0; $j < 4; $j++)
        {
            $N1 = 0;
            $N2 = 0;

            $s1 = getmicrotime();
            for($i = 0; $i < 100; $i++)
            {
                $sql = str_replace("#i#", $i, $strSql);
            }
            $e1 = getmicrotime();
            $N1 = $e1 - $s1;

            $s2 = getmicrotime();
            for($i = 0; $i < 100; $i++)
            {
                //This is one op
                $sql = str_replace("#i#", $i, $strSql);
                $rs = $DB->Query($sql);
                if($bFetch)
                    $rs->Fetch();
            }
            $e2 = getmicrotime();
            $N2 = $e2 - $s2;


            if($N2 > $N1)
                $res[] = 100 / ($N2 - $N1);
        }

        if(count($res))
            return array_sum($res)/doubleval(count($res));
        else
            return 0;
    }
echo GetPHPCPUMark();
?>