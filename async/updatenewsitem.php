<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_UpdateNewsItem_AsyncAction extends Basic_Abstract_AsyncAction
    {
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
			      $flag = false;
            
            $subjectErr = array();
            $subject_enErr = array();
            $contentErr = array();
            $content_enErr = array();
            // Extract inputs
            $subject = $this->_getString('subject', $_params, false);
            $subjecten = $this->_getString('subject_en', $_params, false);
            $content = $this->_getString('content', $_params, false);
            $contenten = $this->_getString('content_en', $_params, false);
            $newsid = $this->_getString('newsid', $_params, false);
            
            if (($subject == null) or ($subject == '*')) {
              $subjectErr = array('inputsubjde' => "Input subject (de)!");
              $flag = true;  
            }
            // if (($subjecten == null) or ($subjecten == '*')) {
            //   $subject_enErr = array('inputsubjen' => "Input subject (en)!");
            //   $flag = true;  
            // }
            if (($content == null) or ($content == '*')) {
              $contentErr = array('inputtextde' => "Input text (de)!");
              $flag = true;  
            }
            // if (($contenten == null) or ($contenten == '*')) {
            //   $content_enErr = array('inputtexten' => "Input text (en)!");
            //   $flag = true;  
            // }

            $mess = array_merge($subjectErr, $subject_enErr, $contentErr, $content_enErr);
            $json = json_encode($mess);

            if ($flag) {throw new AsyncActionException($json);}
            else{
                
                $mySql->update('news', array('subject' => $subject, 'subject_en' => $subjecten, 'content' => $content, 'content_en'=>$contenten), array('id' => $newsid));
            }
            
        }
    }
        

?>