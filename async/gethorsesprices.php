<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_GetHorsesPrices_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
			// Extract inputs
            $horsesprices = $mySql->getRecords('prices', array('domain_id' => $_domainId),'`price`');
            
            $this->data['horsesprices'] = $horsesprices;
            
        }
    }
        

?>