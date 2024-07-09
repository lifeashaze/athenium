'use client'
import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import axios from 'axios';

const Dashboard: React.FC = () => {
  const { user } = useUser();
  const [name, setName] = useState<string>('');
  const [classroomCode, setClassroomCode] = useState<string>('');

  const createClassroom = async () => {
    try {
      const res = await axios.post('/api/classrooms/create', { name }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const joinClassroom = async () => {
    try {
      const res = await axios.post('/api/classrooms/join', { code: classroomCode }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  if (!user) return <p>You need to be logged in</p>;

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <div>
        <h2>Create Classroom</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Classroom Name"
        />
        <button onClick={createClassroom}>Create Classroom</button>
      </div>
      <div>
        <h2>Join Classroom</h2>
        <input
          type="text"
          value={classroomCode}
          onChange={(e) => setClassroomCode(e.target.value)}
          placeholder="Classroom Code"
        />
        <button onClick={joinClassroom}>Join Classroom</button>
      </div>
    </div>
  );
};

export default Dashboard;
