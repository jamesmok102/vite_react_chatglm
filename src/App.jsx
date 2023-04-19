import { Heading, Text, Box, Flex, Button, Textarea, useToast, Divider } from "@chakra-ui/react";
import { Card, CardHeader, CardBody, CardFooter } from '@chakra-ui/react'
import { Stack, HStack, VStack, StackDivider } from '@chakra-ui/react'
import { useMediaQuery } from "@chakra-ui/react"
import { useState, useRef, useEffect, useCallback } from "react";
import { SSE } from "sse";
import ReactMarkdown from "react-markdown";
import {Remarkable} from "remarkable";
import DocumentMeta from "react-document-meta";
import {marked} from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css' 

function App() {
 
  let [prompt, setPrompt] = useState(""); 
  let [messages, setMessages] = useState([]); 
  let [displayMsg, setDisplayMsg] = useState([]);
  let [isLoading, setIsLoading] = useState(false); 
  let [result, setResult] = useState(""); 
  const toast = useToast(); 
  const url = import.meta.env.VITE_CHATGLM_STREAM_API || $VITE_CHATGLM_STREAM_API;

  const resultRef = useRef(); 
  const messagesRef = useRef(); 

  const meta = {
    title: 'ChatGLM_6B_FP16',
    meta: {
        "http-equiv": "Content-Security-Policy",
        content: "upgrade-insecure-requests"
    }
}



  let source;

  function renderMessageContent(msg) {
    marked.setOptions({
        renderer: new marked.Renderer(),
        highlight: function (code, _lang) {
            return hljs.highlightAuto(code).value;
        },
        langPrefix: 'hljs language-',
        pedantic: false,
        gfm: true,
        breaks: false,
        sanitize: false,
        smartypants: false,
        xhtml: false
      })

     let html = marked(msg)
     return <div className="show-html" dangerouslySetInnerHTML={{ __html: html }}></div>

}

  useEffect(() => {
    toast({
        title: "請閱讀注意事項⚠️",
        description: '顯存只有16GB，請進行4～5輪對話後請自行清理對話記錄，否則會爆內存！！！',
        status: "info",
        isClosable: true,
    })
  }, [])

  let handleSubmitPromptBtnClicked = async () => {
      if (prompt !== "") {
          setIsLoading(true);
          setResult("");
          setDisplayMsg(
            message => [...message, [
                prompt,
                null,
              ]]
          );
          
          let data = {
              query: prompt,
              history: messages,
          };

          source = new SSE(url, {
              headers: {
                  "Content-Type": "application/json",
              },
              method: "POST",
              payload: JSON.stringify(data),
          });

            source.addEventListener("delta", (e) => {
              
                let payload = JSON.parse(e.data);
                let text = payload.response;
                if (text ) {
                        resultRef.current = text;
                        setDisplayMsg(
                            msg => {
                                let curMsg = [...msg];
                                for(let i = 0; i < curMsg.length; i++) {
                                    if (i === curMsg.length - 1) {
                                        curMsg[i][1] = resultRef.current;
                                    }
                                }
                                return curMsg;
                            }
                        )
                        let scrollDiv = document.getElementById('scrollY');
                        scrollDiv.scrollTop = scrollDiv.scrollHeight;
                    }
            });

          /**
           * readyState 是 EventSource 对象的一个属性，用于表示当前连接的状态。它是一个只读属性，其值为整数，表示连接的状态。以下是 readyState 的可能值：

            0：连接尚未建立。
            1：连接已建立，正在发送请求。
            2：连接已接收到响应，正在处理响应。
            3：连接正在接收数据。
            4：连接已关闭。
            在给定的代码中，source.addEventListener("readystatechange", ...) 用于监听 EventSource 对象的 readystatechange 事件，
            当 readyState 的值发生变化时，会触发该事件。在事件处理函数中，如果 readyState 的值大于等于 2，
            则表示连接已接收到响应，正在处理响应，此时可以将返回的结果添加到对话记录中，并将加载状态设置为 false。
           */
          source.addEventListener("readystatechange",  (e)=>{
              if (e.readyState >= 2) {        
                setMessages(
                        message => [...message, [
                          prompt,
                          resultRef.current
                        ]]
                    );
                  setIsLoading(false);
              }
          });

          source.stream();

      } else {
        toast({
            title: "請輸入prompt",
            status: "warning",
            duration: 3000,
            isClosable: true,
        })
      }
  }

  let handlePromptChange = (e) => {
      let inputValue = e.target.value;
      setPrompt(inputValue);
  }

let handleClearBtnClicked = () => {
    setPrompt("");
    setResult("");
    setMessages([]);
    setDisplayMsg([]);

    toast({
        title: "對話記錄清理成功",
        status: "success",
        duration: 3000,
        isClosable: true,
    })
};


  return (
    
    <Flex
        width={'100vw'}
        height={"100vh"}
        alignContent={{base: "none", md: "center"}}
        justifyContent={{base: "none", md: "center"}}
        bgGradient="linear(to-b, #7f7fd5, #91eae4)"
    >

        <Box >
            <DocumentMeta {...meta} />
            <Flex width={{base: "100vw", md: "xl"}} pt="10px"  px="20px" minHeight={"70vh"}>
              <Card width={{base: "100vw", md: "xl"}} maxH={"70vh"} >
                  <CardHeader>
                      <Heading size='md'>ChatGLM-6B-FP16 對話記錄</Heading>
                  </CardHeader>
                  <CardBody style={{"overflow-y": "auto", "overflow-x": "auto"}} id="scrollY">
                      <Stack divider={<StackDivider />} spacing='4'>
                          {displayMsg.map((msg) => {
                              return (
                                  <Box>
                                      <Heading as="h5" textAlign="left" fontSize="lg" mb="10px">
                                        <ReactMarkdown>{msg[0]}</ReactMarkdown>
                                      </Heading>  
                                      {msg[1] === null ? "" : renderMessageContent(msg[1])}
                                  </Box>
                              );
                          })}
                      </Stack>
                  </CardBody>
              </Card>

            </Flex>
            <Flex width={{base: "100vw", md: "xl"}}   px="20px" py="10px" pb="0px">
                
                 <Textarea
                  value={prompt}
                  onChange={handlePromptChange}
                  placeholder="Insert your prompt here ..."
                  width={{base: "100vw", md: "xl"}}
                  size="lg"
                />
                
            </Flex>
            <Flex px="20px" py="0px" pt="10px">
                <Button
                    isLoading={isLoading}
                    loadingText="Loading..."
                    colorScheme="teal"
                    size="lg"
                    
                    onClick={handleSubmitPromptBtnClicked}
                    >
                    Submit Prompt
                    </Button>
                    <Button
                    colorScheme="teal"
                    size="lg"
                    
                    ml="20px"
                    onClick={handleClearBtnClicked}
                >
                    Clear
                    </Button>
            </Flex>
      </Box>

    </Flex> 
    
  );
}

export default App
