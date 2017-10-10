<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_GetViews_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
			// Extract inputs
            
            $viewsobj = $mySql->mixedselectDistinct('*', array('horses', 'statistics'), 
                    '(statistics.domain_id='.$_domainId.' and statistics.horse_id=horses.id)','horse_id')
                ->fetchAll();

            $this->data['viewsobj'] = $viewsobj;
            
        }
    }
        

?>