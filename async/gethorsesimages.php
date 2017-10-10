<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    
    class Basic_GetHorsesImages_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
			// Extract inputs
            
            $horseid = $this->_getString('horseid', $_params, false);
            $tablename = $this->_getString('tablename', $_params, false);
               
            $mainimageid = $mySql->getRecord('horses', array('id'=>$horseid),'`id`');
            
            $horsesphotos = $mySql->getRecords($tablename, array('horse_id'=>$horseid), '`order_num`');
            
            foreach ($horsesphotos as $key => $value) {
                if ($horsesphotos[$key]['id'] == $mainimageid['main_image']) {
                    $horsesphotos[$key]['main_image'] = true;
                }
            
            }
            
            $this->data['images'] = $horsesphotos;
            
        }
    }
        

?>