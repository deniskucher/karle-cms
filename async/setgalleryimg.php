<?php

    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    /**
     * File upload action
     *
     * @author     Alexander Babayev
     * @copyright Copyright &copy; 2008-2015 Alexander Babayev
     * @since      3.0
     */
    class Basic_SetGalleryImg_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform($_domainId = NULL, array $_params = array())
        {
            $filearr = $this->_getArray('filename', $_params, false);
            $settings = $this->_getArray('settings', $_params, false);
            $maindir = $this->_getString('maindir', $_params, false);
            // $settings = json_decode($settings);
            $tmpdirname = $filearr[1];
            $file = $filearr[0];
            
            $data = array();
            $error = false;
            $formats = array('jpg', 'png', 'gif', 'bmp','jpeg','PNG','JPG','JPEG','GIF','BMP');
            
            $max_size = 5*1024*1024;
            
            $format = @end(explode('.', $file));
            $uploadimg = 'image_'.$_domainId.'_'. time() . rand(10000000, 99999999) .'.'.strtolower($format);

            if (in_array($format, $formats)) {
                $originaldir = 'uploads/'.$maindir.'/original/';

                if(! is_dir( $originaldir ) ) mkdir( $originaldir, 0777 ); // Создадим папку если её нет
                copy('tmp/'.$tmpdirname.'/'.$file, $originaldir.$uploadimg);

            }else{
                $invalidformat = 'Choose the right format!';
            }
            
            
            if (file_exists($originaldir.$uploadimg)) {
                $prthumbs = false;
                foreach ($settings as $key => $value) {

                    $uploaddir = $value['address'];
                    if(! is_dir( $uploaddir ) ) mkdir( $uploaddir, 0777 ); // Создадим папку если её нет
                    $settingswidth = $value['width'];
                    copy($originaldir.$uploadimg, $uploaddir.$uploadimg);
                    if ($key == 'thumbs') $prthumbs = true;
                    
                    $resizeimg = $this->compressImage(mb_strtolower($format),$uploadimg,$settingswidth,$uploaddir, $prthumbs);
                }
                $file = $uploadimg;
            }
            
            $this->dirDel('tmp/'.$tmpdirname);

            

            $data = array('thumbimg'=>$thumbimg, 'uploadimg'=>$uploadimg, 'errorupload'=>$errorupload, 'largefile'=>$response,'invalidformat'=>$invalidformat, 'file'=>$file,'uploaddir'=>$uploaddir, 'width'=>$originalwidth, 'settings'=>$settings);
            
            $answer = array('dirname'=>$dirname,'filename'=>$file,'settings'=>$settings);
            $this->data['answer'] = $data;
        }
        public function compressImage($ext,$uploadedfile,$widththumb,$uploaddir,$prthumb){

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
            if ($width<$widththumb) {
                $widththumb = $width;
            }
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
        
        public function dirDel ($dir){ 
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
    
    }

?>