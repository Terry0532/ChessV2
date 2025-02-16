import React, { useEffect, useState } from 'react';
import { Form, Button } from 'react-bootstrap';

type NewUserProps = {
  socket: any;
  registrationConfirmation: (data: boolean) => void;
};

const NewUser: React.FC<NewUserProps> = ({ socket, registrationConfirmation }) => {
  const [name, setName] = useState<string>("");
  const [nameTaken, setNameTaken] = useState<boolean>(false);
  
  const submitName = () => {
    socket.emit("checkUserDetail", { name });
  };

  const onNameChange = (e) => {
    setName(e.target.value);
  };

  useEffect(() => {
    function checkUserDetailResponse (data: boolean) {
      registrationConfirmation(data);
      setNameTaken(!data ? true : false);
    };

    socket.on("checkUserDetailResponse", checkUserDetailResponse);

    return () => {
      socket.off("checkUserDetailResponse", checkUserDetailResponse);
    };
    // eslint-disable-next-line
  }, []);

  return (
    <Form>
      <Form.Group >
        <Form.Label>Enter Your Name</Form.Label>
        <Form.Control type="text" onChange={onNameChange} placeholder="Name" />
        <Form.Text className="text-muted"></Form.Text>
        <Button onClick={submitName} variant="primary" type="button">
          Submit
        </Button>
        {nameTaken ? <p>This username is taken, choose a different username.</p> : <p></p>}
      </Form.Group>
    </Form>
  );
};

export default NewUser;
