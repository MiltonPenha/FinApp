import { SignUp } from '@clerk/nextjs'

export default function CreateAccountPage() {
  return (
    <div className='h-screen flex items-center justify-center flex-col gap-4'>
        <SignUp />
    </div>
  )
}