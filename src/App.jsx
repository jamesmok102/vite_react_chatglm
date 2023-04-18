import { Heading, Text, Box, Flex, Button, Textarea, useToast, Divider } from "@chakra-ui/react";
import { Card, CardHeader, CardBody, CardFooter } from '@chakra-ui/react'
import { Stack, HStack, VStack, StackDivider } from '@chakra-ui/react'
import { useState, useRef, useEffect, useCallback } from "react";
import { SSE } from "sse";
import ReactMarkdown from "react-markdown";
import {Remarkable} from "remarkable";

function App() {
 
  //const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  let [prompt, setPrompt] = useState(""); // prompt是用户输入的信息
  let [messages, setMessages] = useState([]); // messages是对话记录
  let [isLoading, setIsLoading] = useState(false); // isLoading表示是否正在加载中
  let [result, setResult] = useState(""); // result是OpenAI API返回的结果
  const toast = useToast(); // toast是Chakra UI提供的轻量级通知组件
  const url = import.meta.env.VITE_CHATGLM_STREAM_API;

  const resultRef = useRef(); // resultRef是result的引用
  const messagesRef = useRef(); // messagesRef是messages的引用

  let source;

  useEffect(() => {
    document.title = "ChatGLM_6B_FP16"
  }, [])

  useEffect(()=>{  
    //resultRef.current = result;
  }, [result]);

  useEffect(() => {
      messagesRef.current = messages;
      console.log('Messages updated:');
      console.log(messages);
  }, [messages]);

  // 当组件挂载时，向对话记录中添加一条系统消息
//   useEffect(()=>{
//         let newMessage = {
//             role: "system",
//             content: "你現在是一個人工智能助手"
//         }
//         setMessages(message => [...message, newMessage]);
//   }, [])

  //当用户点击“提交”按钮时，向对话记录中添加一条用户消息，并调用OpenAI API
  let handleSubmitPromptBtnClicked = async () => {
      if (prompt !== "") {
          //await setMessages(message => [...message]);
          setIsLoading(true);
          setResult("");

          //http://192.168.123.147:8000/stream
          
          let data = {
              query: prompt,
              history: messages,
              //temperature: 0.7,
              //top_p: 0.95,
              //max_length: 1800,
              //html_entities: false
          };

          source = new SSE(url, {
              headers: {
                  "Content-Type": "application/json",
                  //"Content-Encoding": "none",
                  //'Cache-Control': 'no-cache,no-transform'

              },
              method: "POST",
              payload: JSON.stringify(data),
          });

          // 监听OpenAI API返回的消息
            source.addEventListener("delta", (e) => {
              
                //Tokens will be sent as data-only server-sent events as they become available, with the stream terminated by a data: [DONE] message.
                
                console.log(e)

                //try{
                    let payload = JSON.parse(e.data);
                    console.log(payload)
                    let text = payload.response;
                    if (text ) {
                        //resultRef.current = resultRef.current + text;
                        resultRef.current = text;
                        //console.log("ResultRef.current: " + resultRef.current);
                        setResult(resultRef.current);
                    }
                //} catch {
                    //source.close();
                //}
                
                
                

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
                setResult(resultRef.current)        
                setMessages(
                        message => [...message, [
                          prompt,
                          resultRef.current
                        ]]
                    );
                  setIsLoading(false);
              }
          });


          // 开始监听OpenAI API的返回结果
          source.stream();

      } else {
          alert("Please insert a prompt!");
      }
  }

  

  // 当用户输入prompt时，更新prompt的值
  let handlePromptChange = (e) => {
      let inputValue = e.target.value;
      setPrompt(inputValue);
  }

// 當清除按鈕被點擊時，清空prompt和result，並且加入一條系統消息
let handleClearBtnClicked = () => {
    setPrompt("");
    setResult("");
    setMessages([]);

    // 顯示清除成功的提示
    toast({
        title: "對話記錄清理成功",
        description: "成功清理對話記錄",
        status: "success",
        duration: 3000,
        isClosable: true,
    })
};


  return (
      <Flex
          width={"100vw"}
          minHeight={"100vh"}
          alignContent={"center"}
          justifyContent={"center"}
          bgGradient="linear(to-b, #7f7fd5, #91eae4)"
      >
          <Box maxW="2xl" m="0 auto" mr="0" p="20px" minHeight={"100vh"}>
              <Card minW="xl" maxH={"95vh"} >
                  <CardHeader>
                      <Heading size='md'>對話記錄</Heading>
                  </CardHeader>
                  <CardBody style={{"overflow-y": "auto", "overflow-x": "auto"}}>
                      <Stack divider={<StackDivider />} spacing='4'>
                          {messages.map((msg) => {
                              return (
                                  <Box>
                                      <Heading as="h5" textAlign="left" fontSize="lg" mb="10px">
                                        <ReactMarkdown>{msg[0]}</ReactMarkdown>
                                      </Heading>  
                                      <ReactMarkdown>{msg[1]}</ReactMarkdown>
                                  </Box>
                              );
                          })}
                      </Stack>
                  </CardBody>
              </Card>

          </Box>
          <Box maxW="2xl" m="0 auto" ml="0"  p="20px" minHeight={"100vh"}>
              <Heading
                  as="h1"
                  textAlign="center"
                  fontSize="5xl"
                  mt="20px"
                  bgGradient="linear(to-l, #0083b0, #0083b0)"
                  bgClip="text"
              >
                  基於ChatGLM-6B的聊天室
              </Heading>
              <Heading as="h2" textAlign="center" fontSize="3xl" >
                  增加和修改以具備記憶上下文和流傳輸功能
              </Heading>
              <Text fontSize="xl" textAlign="center" mt="30px">
              我是一个名为 ChatGLM-6B 的人工智能助手，是基于清华大学 KEG 实验室和智谱 AI 公司于 2023 年共同训练的语言模型开发的。我的任务是针对用户的问题和要求提供适当的答复和支持。
              </Text>
              <Textarea
                  value={prompt}
                  onChange={handlePromptChange}
                  placeholder="Insert your prompt here ..."
                  mt="30px"
                  size="lg"
              />
              <Button
                  isLoading={isLoading}
                  loadingText="Loading..."
                  colorScheme="teal"
                  size="lg"
                  mt="30px"
                  onClick={handleSubmitPromptBtnClicked}
              >
                  Submit Prompt
              </Button>
              <Button
                  colorScheme="teal"
                  size="lg"
                  mt="30px"
                  ml="20px"
                  onClick={handleClearBtnClicked}
              >
                  Clear
              </Button>
              {result != "" && (
                  <Box maxW="2xl" maxH="50vh" m="0 auto" px="2" style={{"overflow-y": "auto", "overflow-x": "hidden"}}>
                      <Heading as="h5" textAlign="left" fontSize="lg" mt="40px">
                          Result:
                      </Heading>
                        <ReactMarkdown>{result}</ReactMarkdown>

                        {/* <div dangerouslySetInnerHTML={{ __html: result }}></div> */}
                  </Box>
              )}
          </Box>
      </Flex>
  );
}

export default App
