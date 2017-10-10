<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_CreatePhotoFromVideo_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            // $newsimg = array();
            $mySql = Application::getService('basic.mysqlmanager');
			// Extract inputs
            
            $horseId = $this->_getString('horseid', $_params, true);
            $videoId = $this->_getString('videoid', $_params, true);
            $time = $this->_getString('time', $_params, true);
            $frame = $this->_getString('frame', $_params, true);
            $domainId = $_domainId;
            
            $video = $mySql->getRecord('horse_videos_v2', array('id'=>$videoId), '`id`');
            
            $iniArray = parse_ini_file("application/configs/application.ini");
            $ffmpeg = $iniArray['settings.ffmpeg'];

            $videoDirPathWay = VIDEOS_V2_PATH;
            $beforeSlash = stristr($videoDirPathWay, '/', true);
            if (!strlen($beforeSlash) > 0) {
                $videoDirPathWay = substr($videoDirPathWay, 1);
            };

            $videoDirPath = $videoDirPathWay.$domainId.'/'.$horseId.'/'.$videoId.'/';
            $originalVideoFilePath = $videoDirPath.'original.mp4';
            $fileName = $domainId.'-'.$horseId.'-'.$videoId.'-'.time().rand(10000000,99999999).'%02d.jpg';
            $output = $videoDirPathWay.'temp/'.$fileName;

            $filename2 = 'image_'.$domainId.'_'.time().rand(10000000,99999999).'.jpg';
            $originalImage = PHOTOS_ORIGINAL_PATH.'/'.$filename2;
            $thumb = PHOTOS_THUMBS_PATH.'/'.$filename2;
            $large = PHOTOS_LARGE_PATH.'/'.$filename2;
            $medium = PHOTOS_MEDIUM_PATH.'/'.$filename2;

            $time -= 0.24;
            if ($video['source_file_extension'] == 'vob')
                // scale=1024:576
                $cmd = "$ffmpeg -vframes 12 -vf scale=1024:576 -an -ss $time -y -i $originalVideoFilePath -deinterlace -f image2 -y $output"; // Live
                //$cmd = "$ffmpeg -i $originalVideoFilePath -vframes 12 -vf scale=1024:576 -an -ss $time -y -f image2 -y $output"; // Local
            else
                // $cmd = "$ffmpeg -vframes 12 -an -ss $time -y -i $originalVideoFilePath -deinterlace -f image2 -y $output"; // Live
                //$cmd = "$ffmpeg -i $originalVideoFilePath -vframes 12 -an -ss $time -y -f image2 -y $output"; // Local
                $cmd = "$ffmpeg -i $originalVideoFilePath -vframes 12 -an -ss $time -y -f image2 -y $output"; //edit by Denis Kucher 09.10.2017

            $handle = popen($cmd, 'r');
            $read = fread($handle, 2096);
            pclose($handle);

            $settingsArr = $mySql->getRecords('settings', array('domain_id' => $_domainId),'`id`');
            
            foreach ($settingsArr as $key => $value) {
                if ($value['name'] == 'horse_thumb_width') $thumbWidth = $value['value'];
                if ($value['name'] == 'horse_thumb_height') $thumbHeight = $value['value'];
                if ($value['name'] == 'horse_preview_width') $previewWidth = $value['value'];
                if ($value['name'] == 'horse_preview_height') $previewHeight = $value['value'];
            }
            $mediumWidth = 600;
            $mediumHeight = 450;

            $file = sprintf($output, $frame);

            copy($file, $originalImage);
            chmod($originalImage, 0777);

            $this->_createThumb($file, $thumb, $thumbWidth, $thumbHeight, 75);
            $this->_createThumb($file, $large, $previewWidth, $previewHeight, 75);
            $this->_createThumb($file, $medium, $mediumWidth, $mediumHeight, 75);

            $this->data['filename'] = $filename2;
            
        }
        
    }
        

?>