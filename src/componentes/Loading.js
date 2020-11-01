import React from 'react'

export default function Loading({blanco,align}){
    return (
        <div className={align ? align=="right" ? "Loading ml-auto":"Loading mr-auto" : "Loading ml-auto mr-auto"}>
            <div className={blanco ? "Loading__dot-1 bg-white" : "Loading__dot-1 bg-517ea4"}></div>
            <div className={blanco ? "Loading__dot-2 bg-white" : "Loading__dot-2 bg-517ea4"}></div>
            <div className={blanco ? "Loading__dot-3 bg-white" : "Loading__dot-3 bg-517ea4"}></div>
        </div>
    )
}