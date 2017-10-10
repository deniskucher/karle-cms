<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_GetMenu_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
			// Extract inputs
            
            $menuitems = $mySql->getRecords('menu', array('domain_id' => $_domainId),'`order_num`');
            
            if (!$menuitems) {
                
                throw new AsyncActionException('Data not found.');

            }
            $pagesitems = $mySql->getRecords('pages', array('domain_id' => $_domainId),'`id`');

            foreach ($menuitems as $mkey => $mvalue) {
                foreach ($pagesitems as $pkey => $pvalue) {
                    if ($mvalue['page_id'] == $pvalue['id']) {
                    $menuitems[$mkey]['titlede_p'] = $pvalue['title_de'];
                    $menuitems[$mkey]['titleen_p'] = $pvalue['title_en'];
                    } 
                }
                
                    
            }

            $this->data['tabledata'] = $menuitems;
            $this->data['pagesitems'] = $pagesitems;
            
        }
    }
        

?>