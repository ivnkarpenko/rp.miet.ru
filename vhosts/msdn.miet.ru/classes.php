<?
class CCaptcha
	{
		var $imageWidth = 180;
		var $imageHeight = 40;

		var $codeLength = 5;

		var $ttfFilesPath = "/";
		var $arTTFFiles = array("font.ttf");

		var $textAngleFrom = -20;
		var $textAngleTo = 20;
		var $textStartX = 7;
		var $textDistanceFrom = 27;
		var $textDistanceTo = 32;
		var $textFontSize = 20;

		var $bTransparentText = True;
		var $transparentTextPercent = 10;

		var $arTextColor = array(array(0, 100), array(0, 100), array(0, 100));

		var $arBGColor = array(array(255, 255), array(255, 255), array(255, 255));

		var $numEllipses = 100;
		var $arEllipseColor = array(array(127, 255), array(127, 255), array(127, 255));

		var $numLines = 20;
		var $arLineColor = array(array(110, 250), array(110, 250), array(110, 250));
		var $bLinesOverText = False;

		var $arBorderColor = array(0, 0, 0);

		var $arChars = array(
				'A','B','C','D','E','F','G','H','J','K','L','M',
				'N','P','Q','R','S','T','U','V','W','X','Y','Z',
				'2','3','4','5','6','7','8','9'
			);//'1','I','O','0',


		var $image;
		var $code;
		var $codeCrypt;
		var $sid;


		/* SET */
		function SetImageSize($width, $height)
		{
			$width = IntVal($width);
			$height = IntVal($height);

			if ($width > 0)
				$this->imageWidth = $width;

			if ($height > 0)
				$this->imageHeight = $height;
		}

		function SetCodeLength($length)
		{
			$length = IntVal($length);

			if ($length > 0)
				$this->codeLength = $length;
		}

		function SetTTFFontsPath($ttfFilesPath)
		{
			if (strlen($ttfFilesPath) > 0)
				$this->ttfFilesPath = $ttfFilesPath;
		}

		function SetTTFFonts($arFonts)
		{
			if (!is_array($arFonts) || count($arFonts) <= 0)
				$arFonts = array();

			$this->arTTFFiles = $arFonts;
		}

		function SetTextWriting($angleFrom, $angleTo, $startX, $distanceFrom, $distanceTo, $fontSize)
		{
			$angleFrom = IntVal($angleFrom);
			$angleTo = IntVal($angleTo);
			$startX = IntVal($startX);
			$distanceFrom = IntVal($distanceFrom);
			$distanceTo = IntVal($distanceTo);
			$fontSize = IntVal($fontSize);

			$this->textAngleFrom = $angleFrom;
			$this->textAngleTo = $angleTo;

			if ($startX > 0)
				$this->textStartX = $startX;

			if ($distanceFrom > 0)
				$this->textDistanceFrom = $distanceFrom;

			if ($distanceTo > 0)
				$this->textDistanceTo = $distanceTo;

			if ($fontSize > 0)
				$this->textFontSize = $fontSize;
		}

		function SetTextTransparent($bTransparentText, $transparentTextPercent = 10)
		{
			$this->bTransparentText = ($bTransparentText ? True : False);
			$this->transparentTextPercent = IntVal($transparentTextPercent);
		}

		function SetColor($arColor)
		{
			if (!is_array($arColor) || count($arColor) != 3)
				return False;

			$arNewColor = array();
			$bCorrectColor = True;

			for ($i = 0; $i < 3; $i++)
			{
				if (!is_array($arColor[$i]))
					$arColor[$i] = array($arColor[$i]);

				for ($j = 0; $j < 2; $j++)
				{
					if ($j > 0)
					{
						if (!array_key_exists($j, $arColor[$i]))
							$arColor[$i][$j] = $arColor[$i][$j - 1];
					}

					$arColor[$i][$j] = IntVal($arColor[$i][$j]);
					if ($arColor[$i][$j] < 0 || $arColor[$i][$j] > 255)
					{
						$bCorrectColor = False;
						break;
					}

					if ($j > 0)
					{
						if ($arColor[$i][$j] < $arColor[$i][$j - 1])
						{
							$bCorrectColor = False;
							break;
						}
					}

					$arNewColor[$i][$j] = $arColor[$i][$j];

					if ($j > 0)
						break;
				}
			}

			if ($bCorrectColor)
				return $arNewColor;

			return False;
		}

		function SetBGColor($arColor)
		{
			if ($arNewColor = $this->SetColor($arColor))
				$this->arBGColor = $arNewColor;
		}

		function SetTextColor($arColor)
		{
			if ($arNewColor = $this->SetColor($arColor))
				$this->arTextColor = $arNewColor;
		}

		function SetEllipseColor($arColor)
		{
			if ($arNewColor = $this->SetColor($arColor))
				$this->arEllipseColor = $arNewColor;
		}

		function SetLineColor($arColor)
		{
			if ($arNewColor = $this->SetColor($arColor))
				$this->arLineColor = $arNewColor;
		}

		function SetBorderColor($arColor)
		{
			if ($arNewColor = $this->SetColor($arColor))
				$this->arBorderColor = $arNewColor;
		}

		function SetEllipsesNumber($num)
		{
			$this->numEllipses = IntVal($num);
		}

		function SetLinesNumber($num)
		{
			$this->numLines = IntVal($num);
		}

		function SetLinesOverText($bLinesOverText)
		{
			$this->bLinesOverText = ($bLinesOverText ? True : False);
		}

		function SetCodeChars($arChars)
		{
			if (is_array($arChars) && count($arChars) > 0)
				$this->arChars = $arChars;
		}


		/* UTIL */
		function GetColor($arColor)
		{
			$arResult = array();
			for ($i = 0; $i < count($arColor); $i++)
			{
				$arResult[$i] = round(rand($arColor[$i][0], $arColor[$i][1]));
			}
			return $arResult;
		}

		function CreateImage()
		{
			if ($this->bTransparentText)
			{
				$this->image = imagecreatetruecolor($this->imageWidth, $this->imageHeight);
				$arBGColor = $this->GetColor($this->arBGColor);
				$bgColor = imagecolorallocate($this->image, $arBGColor[0], $arBGColor[1], $arBGColor[2]);
				imagefilledrectangle($this->image, 0, 0, imagesx($this->image), imagesy($this->image), $bgColor);
			}
			else
			{
				$this->image = imagecreate($this->imageWidth, $this->imageHeight);
				$arBGColor = $this->GetColor($this->arBGColor);
				$bgColor = imagecolorallocate($this->image, $arBGColor[0], $arBGColor[1], $arBGColor[2]);
			}

			$this->DrawEllipses();

			if (!$this->bLinesOverText)
				$this->DrawLines();

			$this->DrawText();

			if ($this->bLinesOverText)
				$this->DrawLines();

			$arBorderColor = $this->GetColor($this->arBorderColor);
			$borderColor = imagecolorallocate($this->image, $arBorderColor[0], $arBorderColor[1], $arBorderColor[2]);
			imageline($this->image, 0, 0, $this->imageWidth-1, 0, $borderColor);
			imageline($this->image, 0, 0, 0, $this->imageHeight-1, $borderColor);
			imageline($this->image, $this->imageWidth-1, 0, $this->imageWidth-1, $this->imageHeight-1, $borderColor);
			imageline($this->image, 0, $this->imageHeight-1, $this->imageWidth-1, $this->imageHeight-1, $borderColor);
		}

		function CreateImageError($arMsg)
		{
			$this->image = imagecreate($this->imageWidth, $this->imageHeight);
			$bgColor = imagecolorallocate($this->image, 0, 0, 0);
			$textColor = imagecolorallocate($this->image, 255, 255, 255);

			if (!is_array($arMsg))
				$arMsg = array($arMsg);

			$bTextOut = False;
			$y = 5;
			for ($i = 0; $i < count($arMsg); $i++)
			{
				if (strlen(Trim($arMsg[$i])) > 0)
				{
					$bTextOut = True;
					imagestring($this->image, 3, 5, $y, $arMsg[$i], $textColor);
					$y += 15;
				}
			}

			if (!$bTextOut)
			{
				imagestring($this->image, 3, 5, 5, "Error!", $textColor);
				imagestring($this->image, 3, 5, 20, "Reload the page!", $textColor);
			}
		}

		function DestroyImage()
		{
			imagedestroy($this->image);
		}

		function ShowImage()
		{
			imagejpeg($this->image);
		}

		function DrawText()
		{
			if ($this->bTransparentText)
				$alpha = floor($this->transparentTextPercent / 100 * 127);

			$x = $this->textStartX;
			$yMin = ($this->imageHeight / 2) + ($this->textFontSize / 2) - 2;
			$yMax = ($this->imageHeight / 2) + ($this->textFontSize / 2) + 2;

			//putenv("GDFONTPATH=".$_SERVER["DOCUMENT_ROOT"].$this->ttfFilesPath);

			for ($i = 0; $i < $this->codeLength; $i++)
			{
				$arTextColor = $this->GetColor($this->arTextColor);

				if ($this->bTransparentText)
					$color = imagecolorallocatealpha($this->image, $arTextColor[0], $arTextColor[1], $arTextColor[2], $alpha);
				else
					$color = imagecolorallocate($this->image, $arTextColor[0], $arTextColor[1], $arTextColor[2]);

				$angle = rand($this->textAngleFrom, $this->textAngleTo);
				$y = rand($yMin, $yMax);

				$ttfFile = $this->arTTFFiles[rand(1, count($this->arTTFFiles)) - 1];

				//imagettftext($this->image, $this->textFontSize, $angle, $x, $y, $color, $ttfFile, substr($this->code, $i, 1));
				imagettftext($this->image, $this->textFontSize, $angle, $x, $y, $color, $_SERVER["DOCUMENT_ROOT"].$this->ttfFilesPath."/".$ttfFile, substr($this->code, $i, 1));

				$x += rand($this->textDistanceFrom, $this->textDistanceTo);
			}
		}

		function DrawEllipses()
		{
			if ($this->numEllipses > 0)
			{
				for ($i = 0; $i < $this->numEllipses; $i++)
				{
					$arEllipseColor = $this->GetColor($this->arEllipseColor);
					$color = imagecolorallocate($this->image, $arEllipseColor[0], $arEllipseColor[1], $arEllipseColor[2]);
					imagefilledellipse($this->image, round(rand(0, $this->imageWidth)), round(rand(0, $this->imageHeight)), round(rand(0, $this->imageWidth / 8)), round(rand(0, $this->imageHeight / 2)), $color);
				}
			}
		}

		function DrawLines()
		{
			if ($this->numLines > 0)
			{
				for ($i = 0; $i < $this->numLines; $i++)
				{
					$arLineColor = $this->GetColor($this->arLineColor);
					$color = imagecolorallocate($this->image, $arLineColor[0], $arLineColor[1], $arLineColor[2]);
					imageline($this->image, rand(1, $this->imageWidth), rand(1, $this->imageHeight / 2), rand(1, $this->imageWidth), rand($this->imageHeight / 2, $this->imageHeight), $color);
				}
			}
		}

		/* OUTPUT */
		function Output()
		{
			header("Expires: Sun, 1 Jan 2000 12:00:00 GMT");
			header("Last-Modified: ".gmdate("D, d M Y H:i:s")."GMT");
			header("Cache-Control: no-store, no-cache, must-revalidate");
			header("Cache-Control: post-check=0, pre-check=0", false);
			header("Pragma: no-cache");
			header("Content-Type: image/jpeg");
			$this->CreateImage();
			$this->ShowImage();
			$this->DestroyImage();
		}

		function OutputError()
		{
			header("Expires: Sun, 1 Jan 2000 12:00:00 GMT");
			header("Last-Modified: ".gmdate("D, d M Y H:i:s")."GMT");
			header("Cache-Control: no-store, no-cache, must-revalidate");
			header("Cache-Control: post-check=0, pre-check=0", false);
			header("Pragma: no-cache");
			header("Content-Type: image/jpeg");

			$numArgs = func_num_args();
			if ($numArgs > 0)
				$arMsg = func_get_arg(0);
			else
				$arMsg = array();

			$this->CreateImageError($arMsg);
			$this->ShowImage();
			$this->DestroyImage();
		}


		/* CODE */
		function SetCode()
		{
			$max = count($this->arChars);

			$this->code = "";
			for ($i = 0; $i < $this->codeLength; $i++)
				$this->code .= $this->arChars[rand(1, $max) - 1];

			$this->sid = time();

			if (!is_array($_SESSION["CAPTCHA_CODE"]))
				$_SESSION["CAPTCHA_CODE"] = array();

			$_SESSION["CAPTCHA_CODE"][$this->sid] = $this->code;
		}

		function SetCodeCrypt($password = "")
		{

			$max = count($this->arChars);

			$this->code = "";
			for ($i = 0; $i < $this->codeLength; $i++)
				$this->code .= $this->arChars[rand(1, $max) - 1];

			if (!array_key_exists("CAPTCHA_PASSWORD", $_SESSION) || strlen($_SESSION["CAPTCHA_PASSWORD"]) <= 0)
				$_SESSION["CAPTCHA_PASSWORD"] = randString(10);

			$this->codeCrypt = $this->CryptData($this->code, "E", $_SESSION["CAPTCHA_PASSWORD"]);
		}



		function InitCode($sid)
		{


			if (!is_array($_SESSION["CAPTCHA_CODE"]) || count($_SESSION["CAPTCHA_CODE"]) <= 0)
				return False;



				if (!array_key_exists($sid, $_SESSION["CAPTCHA_CODE"]))
				return False;

			$this->code = $_SESSION["CAPTCHA_CODE"][$sid];
			$this->sid = $sid;
			$this->codeLength = strlen($this->code);

			return True;
		}

		function InitCodeCrypt($codeCrypt, $password = "")
		{

			if (strlen($codeCrypt) <= 0)
				return False;

			if (!array_key_exists("CAPTCHA_PASSWORD", $_SESSION) || strlen($_SESSION["CAPTCHA_PASSWORD"]) <= 0)
				return False;

			$this->codeCrypt = $codeCrypt;
			$this->code = $this->CryptData($codeCrypt, "D", $_SESSION["CAPTCHA_PASSWORD"]);
			$this->codeLength = strlen($this->code);

			return True;
		}

		function GetSID()
		{
			return $this->sid;
		}

		function GetCodeCrypt()
		{

			return $this->codeCrypt;
		}


		function CheckCode($userCode, $sid, $bUpperCode = True)
		{

			if (!is_array($_SESSION["CAPTCHA_CODE"]) || count($_SESSION["CAPTCHA_CODE"]) <= 0)
				return False;

			if (!array_key_exists($sid, $_SESSION["CAPTCHA_CODE"]))
				return False;

			if ($bUpperCode)
				$userCode = strtoupper($userCode);

			if ($_SESSION["CAPTCHA_CODE"][$sid] != $userCode)
				return False;

			unset($_SESSION["CAPTCHA_CODE"][$sid]);

			return True;
		}

		function CheckCodeCrypt($userCode, $codeCrypt, $password = "", $bUpperCode = True)
		{
			if (strlen($codeCrypt) <= 0)
				return False;

			if (!array_key_exists("CAPTCHA_PASSWORD", $_SESSION) || strlen($_SESSION["CAPTCHA_PASSWORD"]) <= 0)
				return False;

			if ($bUpperCode)
				$userCode = strtoupper($userCode);

			$code = $this->CryptData($codeCrypt, "D", $_SESSION["CAPTCHA_PASSWORD"]);

			if ($code != $userCode)
				return False;

			return True;
		}

		function CryptData($data, $type, $pwdString)
		{
			$type = strtoupper($type);
			if ($type != "D")
				$type = "E";

			$res_data = "";

			if ($type == 'D')
				$data = base64_decode(urldecode($data));

			$key[] = "";
			$box[] = "";
			$temp_swap = "";
			$pwdLength = strlen($pwdString);

			for ($i = 0; $i <= 255; $i++)
			{
				$key[$i] = ord(substr($pwdString, ($i % $pwdLength), 1));
				$box[$i] = $i;
			}
			$x = 0;

			for ($i = 0; $i <= 255; $i++)
			{
				$x = ($x + $box[$i] + $key[$i]) % 256;
				$temp_swap = $box[$i];
				$box[$i] = $box[$x];
				$box[$x] = $temp_swap;
			}
			$temp = "";
			$k = "";
			$cipherby = "";
			$cipher = "";
			$a = 0;
			$j = 0;
			for ($i = 0; $i < strlen($data); $i++)
			{
				$a = ($a + 1) % 256;
				$j = ($j + $box[$a]) % 256;
				$temp = $box[$a];
				$box[$a] = $box[$j];
				$box[$j] = $temp;
				$k = $box[(($box[$a] + $box[$j]) % 256)];
				$cipherby = ord(substr($data, $i, 1)) ^ $k;
				$cipher .= chr($cipherby);
			}

			if ($type == 'D')
				$res_data = urldecode(urlencode($cipher));
			else
				$res_data = urlencode(base64_encode($cipher));

			return $res_data;
		}

	}
?>