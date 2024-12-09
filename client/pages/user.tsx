import { Editor, EditorProps, Monaco, MonacoDiffEditor } from '@monaco-editor/react'
import initSqlJs, { Database } from 'sql.js';
import React, { useEffect, useState } from 'react'
import { DbStructure } from '@/types/DbStructure';
import { QueryParser } from '@/app_utils/QueryParser';

const user = () => {
  const [query,setQuery]=useState<string>("")
  const [db,setDb]=useState<Database|null>(null)
  const executeQuery=()=>{
    try{
      if(!db){
        console.log("no db connected")
        return 
      }
      const result=db.exec(query)
      if(result.length==0){
        console.log("no results")
      }
     const list=QueryParser(query)
     console.log("list ",list)
    }catch(err){
      console.log("error",err)
      return 
    }
  }
  const handleEditorMount=(editor:EditorProps,monaco:Monaco)=>{
    monaco.languages.registerCompletionItemProvider('sql',{
      provideCompletionItems:()=>{
        const suggestions=[
          {
            label:"SELECT",
            kind:monaco.languages.CompletionItemKind.Keyword,
            insertText:'SELECT'
            
          },{
            label:"WHERE",
            kind:monaco.languages.CompletionItemKind.Keyword,
            insertText:"WHERE"
          },{
            label:"FROM",
            kind:monaco.languages.CompletionItemKind.Keyword,
            insertText:"FROM"
          }, 
          {
            label:"CREATE",
            kind:monaco.languages.CompletionItemKind.Keyword,
            insertText:"CREATE TABLE"
          }
        ]
        return {suggestions}
      }
    })
  }
  const handleEditorChange=(editor:MonacoDiffEditor,monaco:Monaco)=>{
    editor.onDidChangeModelContent(()=>{
      const value=editor.getValue()
      setQuery(value)
    })
  
  }
  useEffect(()=>{
    const loadSqljs=async()=>{
      const Sql = await initSqlJs({
         locateFile: file => `https://sql.js.org/dist/${file}` //getting sql engine
      });
      
      const database=new Sql.Database()
      setDb(database)
    }
    loadSqljs()
  },[])
  return (
    <div className='flex items-center justify-center md:w-4/12'>
      <Editor

      height={"90vh"}
      defaultLanguage='sql'
      theme='custom-theme'
      beforeMount={monaco => {
        monaco.editor.defineTheme('custom-theme', {
          base: 'vs-dark', // Start with the 'vs-dark' base theme
      inherit: true,    // Inherit other settings from the base theme
      rules: [],        // Customize rules (if needed)
      colors: {
        'editor.background': '#17010A', // Set background color to black
      },
        });
      }}
      options={{
        wordWrap:"on"
      }}
      onMount={(editor,monaco:Monaco)=>{
        handleEditorMount(editor,monaco)
        handleEditorChange(editor,monaco)
      }}
      />
      <button onClick={()=>executeQuery()}>Execute</button>
    </div>
  )
}

export default user