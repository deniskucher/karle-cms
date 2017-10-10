<?php

    // Load abstract action
           
            $data = array();
            $error = false;
            $formats = array("jpg", "png", "gif", "bmp","jpeg","PNG","JPG","JPEG","GIF","BMP");
            $max_size = 25000000;
            $files = array();
            
            foreach( $_FILES as $file ){
                $format = @end(explode('.', $file['name']));

                // echo $_FILES;
                $fileonserver = $file['tmp_name'];
                
                $uploadimg = 'image_'.$file['usersid'].'_'.rand(10,99).substr(time(), -8).'.'.$format;
                
                    
                    
                 
                    $uploaddir = '../../../../uploads/news/photos/'; 
                    $uploaddirthumbs = '../../../../uploads/news/thumbs/'; 
                    if(! is_dir( $uploaddir ) ) mkdir( $uploaddir, 0777 ); // Создадим папку если её нет
                    if(! is_dir( $uploaddirthumbs ) ) mkdir( $uploaddirthumbs, 0777 ); // Создадим папку если её нет
                    if (in_array($format, $formats)) {
                        
                        if (is_uploaded_file($file['tmp_name'])) {
                            if ($file['size'] > $max_size){
                                $response = 'File is too large';
                            }
                            else{
                                
                                if (move_uploaded_file($file['tmp_name'], $uploaddir.$uploadimg)) {
                                    copy($uploaddir.$uploadimg, $uploaddirthumbs.$uploadimg);
                                    $resizeimg = compressImage($format,$uploadimg,900,$uploaddir, false);
                                    // $files[] = realpath( $uploaddir.$uploadimg);                            
                                    $files[] = $uploadimg;                            
                                }
                                else{
                                    $errorupload = 'Ошибка загрузки файлов';
                                }
                            }
                        }

                    }
                    else{
                            $invalidformat = 'Выберите правильный формат!';
                        }
                    
                    $thumbimg = compressImage($format,$uploadimg,300,$uploaddirthumbs, true);
            } 
                
                    
            function compressImage($ext,$uploadedfile,$widththumb,$uploaddir,$prthumb)
            {

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
            
            $data = array('thumbimg'=>$thumbimg, 'uploadimg'=>$uploadimg, 'errorupload'=>$errorupload, 'invalidformat'=>$invalidformat, 'files'=>$files);		
         
            echo json_encode( $data );
    
    

?>