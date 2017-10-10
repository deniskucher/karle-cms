<?php

    // Load abstract action
        /**
           * 
           */
           // class ClassName extends AnotherClass
           // {
               
           //     function __construct(argument)
           //     {
           //         # code...
           //     }
           // }   
            $data = array();
            $error = false;
            $formats = array('jpg', 'png', 'gif', 'bmp','jpeg','PNG','JPG','JPEG','GIF','BMP');
            // $formats = "image";
            $max_size = 5000000;
            $files = array();

            foreach( $_FILES as $file ){
                $format = @end(explode('.', $file['name']));
                // $format = explode('/', $file['type']);

                // echo $_FILES;
                $fileonserver = $file['tmp_name'];
                
                $uploadimg = 'image_'.$_POST['domainid'].'_'. time() . rand(10000000, 99999999) .'.'.$format;
                    
                $settings = $_POST['settings'];
                $settings =  json_decode($settings, TRUE); 
    
                $uploaddirtemp = '../../../../uploads/temp/';
                if (in_array($format, $formats)) {
                // if ($format[0] == $formats) { 
                    if (is_uploaded_file($file['tmp_name'])) {
                        if ($file['size'] > $max_size){
                            $response = 'File is too large';
                        }
                        else{
                            
                            if(! is_dir( $uploaddirtemp ) ) mkdir( $uploaddirtemp, 0777 ); // Создадим папку если её нет
                        
                            if (move_uploaded_file($file['tmp_name'], $uploaddirtemp.$uploadimg)) {
                                $files[] = $uploadimg;                            
                            }
                            else{
                                $errorupload = 'Error loading file';
                            }      
                            
                        }
                    }

                }
                else{
                        $invalidformat = 'Choose the right format!';
                    }
                
                if (file_exists($uploaddirtemp.$uploadimg)) {
                    $prthumbs = false;
                    foreach ($settings as $key => $value) {
                        $uploaddir = '../../../..'.$value['address'];
                        if(! is_dir( $uploaddir ) ) mkdir( $uploaddir, 0777 ); // Создадим папку если её нет
                        $settingswidth = $value['width'];
                        copy($uploaddirtemp.$uploadimg, $uploaddir.$uploadimg);
                        if ($key == 'thumbs') $prthumbs = true;
                        
                        $resizeimg = compressImage(mb_strtolower($format),$uploadimg,$settingswidth,$uploaddir, $prthumbs);
                    }
                    
                }
                
                dirDel($uploaddirtemp);
                    
            } 
                
                    
            function compressImage($ext,$uploadedfile,$widththumb,$uploaddir,$prthumb){

                if($ext=="jpg" || $ext=="jpeg" )
                {
                $src = imagecreatefromjpeg($uploaddir.$uploadedfile);
                }
                else if($ext=="png")
                {
                $src = imagecreatefrompng($uploaddir.$uploadedfile);
                }
                else if($ext=="gif")
                {
                $src = imagecreatefromgif($uploaddir.$uploadedfile);
                }
                else
                {
                $src = imagecreatefrombmp($uploaddir.$uploadedfile);
                }
                
                list($width,$height)=getimagesize($uploaddir.$uploadedfile);
                
                $newheight=($height/$width)*$widththumb;
                
                if ($newheight>$widththumb) {
                    $paddingtop = ($newheight - $widththumb)/2;
                }else{
                    $paddingtop = 0;
                }
                   
                if ($prthumb) {
                    $tmp0=imagecreatetruecolor($widththumb,$newheight);
                    imagecopyresampled($tmp0,$src,0,0,0,0,$widththumb,$newheight,$width,$height);
                    
                    $tmp=imagecreatetruecolor($widththumb,$newheight-2*$paddingtop);
                    imagecopyresampled($tmp,$tmp0,0,0,0,$paddingtop,$widththumb,$newheight,$widththumb,$newheight);
                /*Для thumbs вертикальное изображение делаем квадратным, обрезая верх и низ одинаково
                Для того чтобы картинка в потоке не вылазила по высоте*/
                    $thumbimg = $uploadedfile;
                    $adaptiveimage = $uploaddir.$uploadedfile; //PixelSize_TimeStamp.jpg
                }else{

                    $tmp=imagecreatetruecolor($widththumb,$newheight);
                    imagecopyresampled($tmp,$src,0,0,0,0,$widththumb,$newheight,$width,$height);
                    $thumbimg = $uploadedfile;
                    $adaptiveimage = $uploaddir.$uploadedfile;
                }
                
                imagejpeg($tmp,$adaptiveimage,100);
                imagedestroy($tmp);
                
                return $thumbimg;
            }
            
            function dirDel ($dir){ 
                $d=opendir($dir); 
                while(($entry=readdir($d))!==false)
                {
                    if ($entry != "." && $entry != "..")
                    {
                        if (is_dir($dir."/".$entry))
                        { 
                            dirDel($dir."/".$entry); 
                        }
                        else
                        { 
                            unlink ($dir."/".$entry); 
                        }
                    }
                }
                closedir($d); 
                rmdir ($dir); 
            } 
            
            $data = array('thumbimg'=>$thumbimg, 'uploadimg'=>$uploadimg, 'errorupload'=>$errorupload, 'largefile'=>$response,'invalidformat'=>$invalidformat, 'files'=>$files,'uploaddir'=>$uploaddir, 'width'=>$originalwidth, 'settings'=>$settings);     
         
            echo json_encode( $data );
    
    

?>