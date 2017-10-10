<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_GetHorsesViews_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
			// Extract inputs
            $query = $this->_getString('query', $_params, false);

            $columnforsearchmass = array();
            $thname_json = $this->_getString('columnforsearchmass', $_params, false);
            $thname_arr = json_decode($thname_json, TRUE);
            // $horsescategory = $this->_getString('horsescategory', $_params, false);
            // $horsescategory = json_decode($horsescategory, TRUE);
            $horsescategory = array('jumpers' => '0', 'dressage horses' => '1', 'jumpers + dressage horses' => '2', 'foals' => '3', 'breeding mares' => '4', 'stallions' => '5', 'successful horses' => '6', 'hunters' => '7');
            
            
            if (!(($query == '')or($query == '*'))) {
                foreach ($thname_arr as $key => $thname) {
                    if ($thname == 'category_id') {
                        $query = mb_strtolower($query);
                        foreach ($horsescategory as $key1 => $value1) {
                            
                            if (strpos($key1, $query) !== false) {// именно через жесткое сравнение
                                $querycategory = $value1; 
                                if (!$criteria) {
                                    $criteria = 'horses.'.$thname.' LIKE '.mysql_real_escape_string($querycategory);
                                }
                                else{
                                    $criteria .= ' OR horses.'.$thname.' LIKE '.$querycategory;
                                }
                            }
                            
                        }
                        
                        
                    }
                    else{
                        if (!$criteria) {
                            $criteria = 'horses.'.$thname.' LIKE \'%'.mysql_real_escape_string($query).'%\'';
                        }
                        else{
                            $criteria .= ' OR horses.'.$thname.' LIKE \'%'.mysql_real_escape_string($query).'%\'';
                        }
                    }   
                }
                    
            }
            
            if (!$criteria) {
                $tabledata = $mySql->getRecords('horses', array('domain_id' => $_domainId),'`id`');

            }
            else{
                $criteria = '('.$criteria.')'.' AND `domain_id` LIKE '.$_domainId;
                $tabledata = $mySql->getRecords('horses', $criteria, '`id`');
            }
            
            if (!$tabledata) {
            	$this->data['criteria'] = $criteria;
                throw new AsyncActionException('Data not found.');

            }
            
            $this->data['criteria'] = $criteria;
            $this->data['tabledata'] = $tabledata;
            
        }
    }
        

?>