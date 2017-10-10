<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_GetQueueStatus_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {   


            $mySql = Application::getService('basic.mysqlmanager');
			// Extract inputs
            $horseid = $this->_getString('horseid', $_params, true);
            
            $queue = $mySql->getRecords('horse_videos_v2', array('horse_id'=>$horseid));

            $this->data['queue'] = $queue;

        }
    }
        

?>