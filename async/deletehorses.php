<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_DeleteHorses_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            // $newsimg = array();
            $mySql = Application::getService('basic.mysqlmanager');
			// Extract inputs
            $itemid = $this->_getString('itemid', $_params, true);
            
            $uploadimgdirArr = $this->_getArray('uploadimgdirArr', $_params, true);
            $horsesimgArr = $mySql->getRecords('horse_photos', array('horse_id' => $itemid),'`id`');
            $mySql->delete('horses', array('id'=>$itemid));

            $mySql->delete('horse_photos', array('horse_id'=>$itemid));

            foreach ($horsesimgArr as $key1 => $value1) {
                $filename = $value1['filename'];
             
                foreach ($uploadimgdirArr as $value) {
                    @unlink($value.$filename);    
                }

            }
            $this->data['uploadimgdirArr'] = $uploadimgdirArr;
        }
    }
        

?>