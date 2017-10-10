<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_CreateThumbs_AsyncAction extends Basic_Abstract_AsyncAction
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
            $domainId = $_domainId;
            
            $video = $mySql->getRecord('horse_videos_v2', array('id'=>$videoId), '`id`');
            
            $iniArray = parse_ini_file("application/configs/application.ini");
            $ffmpeg = $iniArray['settings.ffmpeg'];
            
            $videoDirPath = VIDEOS_V2_PATH;
            $beforeSlash = stristr($videoDirPath, '/', true);
            if (!strlen($beforeSlash) > 0) {
                $videoDirPath = substr($videoDirPath, 1);
            };

            $originalVideoFilePath = $videoDirPath.$domainId.'/'.$horseId.'/'.$videoId.'/original.mp4';
            $thumbFilenamePattern = $domainId.'-'.$horseId.'-'.$videoId.'-'.time().rand(10000000,99999999).'%02d.jpg';
            $thumbFilePathPattern = $videoDirPath.'temp/'.$thumbFilenamePattern;

            $time -= 0.24;
            if ($video['source_file_extension'] == 'vob')
                $cmd = "$ffmpeg -vframes 12 -vf scale=1024:576 -an -ss $time -y -i $originalVideoFilePath -f image2 -y $thumbFilePathPattern"; // Live
                //$cmd = "$ffmpeg -i $originalVideoFilePath -vframes 12 -vf scale=1024:576 -an -ss $time -y -f image2 -y $thumbFilePathPattern"; // Local
            else
                // $cmd = "$ffmpeg -vframes 12 -an -ss $time -y -i $originalVideoFilePath -f image2 -y $thumbFilePathPattern"; // Live
                //$cmd = "$ffmpeg -i $originalVideoFilePath -vframes 12 -an -ss $time -y -f image2 -y $thumbFilePathPattern"; // Local
                $cmd = "$ffmpeg -i $originalVideoFilePath -vframes 12 -an -ss $time -y -f image2 -y $thumbFilePathPattern"; //edit by Denis Kucher 09.10.2017
            file_put_contents('./logs/create-thumbs-v2.log', $cmd."\n", FILE_APPEND);
            // ffmpeg -vframes 12 -an -ss 47 -y -i video_21_129535322820523411.mov -f image2 test_images3/images%02d.jpg


            $handle = popen($cmd, 'r');
            $read = fread($handle, 2096);
            pclose($handle);

            // $thumbWidth = Default_Model_UserService::i()->getDomainSetting($domainId, 'horse_thumb_width');
            $settingsArr = $mySql->getRecords('settings', array('domain_id' => $_domainId),'`id`');
            
            foreach ($settingsArr as $key => $value) {
                if ($value['name'] == 'horse_thumb_width') $thumbWidth = $value['value'];
                if ($value['name'] == 'horse_thumb_height') $thumbHeight = $value['value'];
            }
            
            $list = array();
            for ($i=1; $i<13; $i++) {
                $list[] = sprintf($thumbFilenamePattern, $i);
                $file = sprintf($thumbFilePathPattern, $i);
                $this->_createThumb($file, $file, $thumbWidth, $thumbHeight, 75);
            }

            $this->data['list'] = $list;
            $this->data['thumbFilenamePattern'] = $thumbFilenamePattern;
            
        }
        
    }
        

?>