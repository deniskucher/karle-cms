<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_GetPrices_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
			// Extract inputs
            $query = $this->_getString('query', $_params, false);
            $thname_arr = $this->_getArray('search', $_params, false);

            $less_more = array('<','>');
            
            if (!(($query == '')or($query == '*'))) {
                foreach ($thname_arr as $key => $thname) {
                    if ($thname == 'price') {
                        $less_more_q = "";
                        $queryPrice = mb_strtolower($query);
                        $queryPrice = str_replace(" ", "", $queryPrice);
                        $positionless = stripos($queryPrice, '<');
                        $positionmore = stripos($queryPrice, '>');
                        ($positionless === false)? $position = $positionmore: $position = $positionless;
                        if ($position !== false) {
                            $pricequery = substr($queryPrice, $position+1);
                            $less_more_q = substr($queryPrice, 0, 1);
                            
                            if ($less_more_q == "<") {
                                $less_more_q = '0';
                            }else{
                                $less_more_q = '1';
                            }
                            
                        }
                        if (!$pricequery) 
                            $pricequery = '1';
                        if (!$less_more_q) 
                            $less_more_q = '1';
                        
                        if (!$criteria) {
                            $criteria = '(prices.price LIKE '.mysql_real_escape_string($pricequery).' AND prices.less_more LIKE '.mysql_real_escape_string($less_more_q).')';
                        }
                        else{
                            $criteria .= ' OR (prices.price LIKE '.mysql_real_escape_string($pricequery).' AND prices.less_more LIKE '.mysql_real_escape_string($less_more_q).')';
                        } 
                    }
                    else{
                        if (!$criteria) {
                            $criteria = 'prices.'.$thname.' LIKE \'%'.mysql_real_escape_string($query).'%\'';
                        }
                        else{
                            $criteria .= ' OR prices.'.$thname.' LIKE \'%'.mysql_real_escape_string($query).'%\'';
                        }
                    }   
                }
                    
            }
            
            if (!$criteria) {
                $tabledata = $mySql->getRecords('prices', array('domain_id' => $_domainId),'`id`');

            }
            else{
                $criteria = '('.$criteria.')'.' AND `domain_id` LIKE '.$_domainId;
                // var_dump($criteria); exit();
                $tabledata = $mySql->getRecords('prices', $criteria, '`id`');
            }
            
            if (!$tabledata) {
            	$this->data['criteria'] = $criteria;
                throw new AsyncActionException('Data not found.');

            }
            
            $this->data['tabledata'] = $tabledata;
            
        }
    }
        

?>