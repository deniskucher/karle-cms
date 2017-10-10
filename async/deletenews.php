<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_DeleteNews_AsyncAction extends Basic_Abstract_AsyncAction
    {   
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {   
            $mySql = Application::getService('basic.mysqlmanager');
            // Extract inputs
            $itemid = $this->_getString('itemid', $_params, true);
            
            $uploadimgdirArr = $this->_getArray('uploadimgdirArr', $_params, true);
            $newsimgArr = $mySql->getRecords('news_images', array('ni_news_id' => $itemid),'`ni_id`');
            $mySql->delete('news', array('id'=>$itemid));

            $mySql->delete('news_images', array('ni_news_id'=>$itemid));

            foreach ($newsimgArr as $key1 => $value1) {
                $filename = $value1['ni_image'];
             
                foreach ($uploadimgdirArr as $value) {
                    @unlink($value.$filename);    
                }
                @unlink('uploads/news/original/'.$filename); 
            }
            $this->data['uploadimgdirArr'] = $uploadimgdirArr;
        }
    }
        

?>