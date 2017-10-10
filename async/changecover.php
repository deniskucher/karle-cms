<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_ChangeCover_AsyncAction extends Basic_Abstract_AsyncAction
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

            $time -= 0.24;
            if ($video['source_file_extension'] == 'vob')
                // scale=1024:576
                $cmd = "$ffmpeg -vframes 12 -vf scale=1024:576 -an -ss $time -y -i $originalVideoFilePath -f image2 -y $output"; // Live
                //$cmd = "$ffmpeg -i $originalVideoFilePath -vframes 12 -vf scale=1024:576 -an -ss $time -y -f image2 -y $output"; // Local
            else
                // $cmd = "$ffmpeg -vframes 12 -an -ss $time -y -i $originalVideoFilePath -f image2 -y $output"; // Live
                //$cmd = "$ffmpeg -i $originalVideoFilePath -vframes 12 -an -ss $time -y -f image2 -y $output"; // Local
                $cmd = "$ffmpeg -i $originalVideoFilePath -vframes 12 -an -ss $time -y -f image2 -y $output"; //edit by Denis Kucher 09.10.2017

            $handle = popen($cmd, 'r');
            $read = fread($handle, 2096);
            pclose($handle);

            $settingsArr = $mySql->getRecords('settings', array('domain_id' => $_domainId),'`id`');
            
            foreach ($settingsArr as $key => $value) {
                if ($value['name'] == 'horse_thumb_width') $thumbWidth = $value['value'];
                if ($value['name'] == 'horse_thumb_height') $thumbHeight = $value['value'];
            }

            $file = sprintf($output, $frame);
            $this->_createThumb($file, $videoDirPath.'thumb.jpg', $thumbWidth, $thumbHeight, 75);

            $this->data['horseid'] = $horseId;
            $this->data['videoid'] = $videoId;
            $this->data['time'] = $time;
            $this->data['frame'] = $frame;
            $this->data['video'] = $video;
            $this->data['videoDirPath'] = $videoDirPath;
            $this->data['originalVideoFilePath'] = $originalVideoFilePath;
            $this->data['output'] = $output;
            
        }
        
    }
        

?>