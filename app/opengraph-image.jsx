import { ImageResponse } from 'next/og';
export const size={width:1200,height:630};
export const contentType='image/png';
export const alt='RobotARQ — Estimación de reformas y revisión técnica';
export default function Image(){return new ImageResponse(<div style={{background:'#102c3b',color:'white',width:'100%',height:'100%',display:'flex',flexDirection:'column',justifyContent:'center',padding:'80px'}}><div style={{fontSize:100,fontWeight:700}}>robotARQ</div><div style={{fontSize:48,marginTop:30}}>Estimación de reformas</div><div style={{fontSize:32,marginTop:20,color:'#bddfe6'}}>Partidas claras · Mediciones · Revisión técnica</div></div>,size);}
