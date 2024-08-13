import React, {useEffect, useState} from 'react';
import { observer } from 'mobx-react-lite';
import {Accordion, Badge, Button, Card, Col, Row} from "react-bootstrap";
import {Link} from "react-router-dom";
import config from "../../../config";
import LoadingSpinner from "../../LoadingSpinner";
import {Instance} from "../../../stores/socketStore";
import {useStores} from "../../../hooks/useStores";

const LinkButton = (props:any) => {
  const { path, label, variant, disabled } = props;

  return (
    <Link to={path} className="text-decoration-none">
      <div className="d-grid gap-2 mt-3">
        <Button variant={variant}>{label}</Button>
      </div>
    </Link>
  );
}

const SlotButton = (props:any) => {
  const { path, label, variant, disabled } = props;

  return (
    <Link to={path} className="text-decoration-none">
      <div className="mt-3 me-2">
        <Button variant={variant}>{label}</Button>
      </div>
    </Link>
  );
}

const SlotButtons = (instance:Instance) => {
  let content = [];
  for (let i = 1; i <= instance.settings.slots; i++) {
    content.push(<SlotButton key={i} path={`/session/${instance.id}/${i}`} label={`Slot ${i}`} variant={'outline-info'}/>);
  }
  return content;
}

const Join: React.FC = (props) => {
  const [ isLoadingInstances, setIsLoadingInstances ] = useState(true);
  const { socketStore } = useStores();

  useEffect(() => {
    setIsLoadingInstances(true);

    fetch(`${config.socketServer}/api/instances.json`)
      .then(response => response.json())
      .then(data => {
        socketStore.setAvailableInstances(data);
        setIsLoadingInstances(false);
      }).catch(() => {
        socketStore.setAvailableInstances([]);
        setIsLoadingInstances(false);
      });
  },[ socketStore ]);

  return (
    <Col className="mt-4 offset-lg-2 col-lg-8 col-md-12">
      <div>
        <h5 className="mb-3">Available Sessions</h5>
        { isLoadingInstances && <LoadingSpinner size='small'/> }
        { !isLoadingInstances && socketStore.availableInstances.length ?
          <Accordion defaultActiveKey={String(7)}>
          { socketStore.availableInstances.map(instance =>
            <Accordion.Item key={instance.id} eventKey={String(instance.id)}>
              <Accordion.Header>{ instance.name }</Accordion.Header>
              <Accordion.Body>
                <Row>
                  <Col lg={6} md={12} className="mb-3">
                    <h6 className="text-muted">Description</h6>
                    <div>{ instance.description }</div>
                  </Col>
                  <Col lg={3} xs={6} className="mb-3">
                    <h6 className="text-muted">Settings</h6>
                    <div>
                      <div>
                        <Badge bg="secondary">slots [ { instance.settings.slots } ]</Badge>
                      </div>
                      { instance.settings.slotPick
                        ? <div>
                          <Badge bg="secondary">slotPick</Badge>
                        </div>
                        : null
                      }
                      { instance.settings.randomPick
                        ? <div>
                            <Badge bg="secondary">randomPick</Badge>
                          </div>
                        : null
                      }
                      { instance.settings.sequentialPick
                        ? <div>
                          <Badge bg="secondary">sequentialPick</Badge>
                        </div>
                        : null
                      }
                    </div>
                  </Col>
                  <Col lg={3} xs={6}>
                    <h6 className="text-muted">Controls</h6>
                    <div className="small overflow-x-hidden">
                      { Object.entries(instance.settings.controls).filter(([key, val]) => !!val).map(([key, val]) =>
                        <div key={ key }>
                          <div>
                            <div className="bg-black ps-2 rounded-top">{ key }</div>
                            <div className="bg-black ps-3 text-muted">{ val.map(v => <div key={v.id}>{v.id}:{v.type}</div>) }</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Col>

                  <div>
                    <hr/>
                    { instance.settings.slotPick &&
                      <>
                        <div className="mt-4 text-center">Choose Slot</div>
                        <div className="btn-group d-flex flex-wrap" role="group" aria-label="Basic outlined example">
                          {SlotButtons(instance)}
                        </div>
                      </>
                    }
                    {instance.settings.randomPick &&
                      <>
                        <div className="mt-4 text-center">Take a randomly selected slot</div>
                        <LinkButton path={`/session/${instance.id}/0`} label={'Join'} variant={'outline-info'}/>
                      </>
                    }
                    { instance.settings.sequentialPick &&
                      <>
                        <div className="mt-4 text-center">Take next free slot</div>
                        <LinkButton path={`/session/${instance.id}/0`} label={'Join'} variant={'outline-info'}/>
                      </>
                    }
                  </div>
                </Row>
              </Accordion.Body>
            </Accordion.Item>
            )}
          </Accordion>
          :
          <div>No sessions found.</div>
        }
      </div>
    </Col>
  )
};

export default observer(Join);