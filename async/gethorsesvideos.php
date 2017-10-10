<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    
    class Basic_GetHorsesVideos_AsyncAction extends Basic_Abstract_AsyncAction
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
               
            $horsesVideos = $mySql->getRecords($tablename, array('horse_id'=>$horseid), '`order`');
            
            foreach ($horsesVideos as $key => $value) {
                $horsesVideos[$key]['domainId'] = $_domainId; 
            }

            $this->data['videos'] = $horsesVideos;
            
        }
    }
        

?>