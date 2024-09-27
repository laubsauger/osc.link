import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { Accordion, Badge, Button, Card, Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import config from "../../../config";
import LoadingSpinner from "../../LoadingSpinner";
import { Instance } from "../../../stores/socketStore";
import { useStores } from "../../../hooks/useStores";
import { useAuth } from "@clerk/clerk-react";

const LinkButton = (props: any) => {
  const { path, label, variant, disabled } = props;

  return (
    <Link to={path} className="text-decoration-none">
      <div className="d-grid gap-2 mt-3">
        <Button variant={variant}>{label}</Button>
      </div>
    </Link>
  );
};

const SlotButton = (props: any) => {
  const { path, label, variant, disabled } = props;

  return (
    <Link to={path} className="text-decoration-none">
      <div className="mt-3 me-2">
        <Button variant={variant}>{label}</Button>
      </div>
    </Link>
  );
};

const SlotButtons = (instance: Instance) => {
  let content = [];
  for (let i = 1; i <= instance.settings.slots; i++) {
    content.push(
      <SlotButton
        key={i}
        path={`/session/${instance.id}/${i}`}
        label={`Slot ${i}`}
        variant={"outline-info"}
      />
    );
  }
  return content;
};

interface JoinProps {
  instances: Instance[];
  isLoadingInstances: boolean;
  deleteInstance: (instance: Instance) => void;
}

const Join: React.FC<JoinProps> = (props) => {
  const { instances, isLoadingInstances } = props;
  return (
    <Col>
      <div>
        {isLoadingInstances && <LoadingSpinner size="small" />}
        {!isLoadingInstances && instances.length ? (
          <Accordion>
            {instances
              .sort(
                (a, b) =>
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime()
              )
              .map((instance) => (
                <Accordion.Item
                  key={instance.id}
                  eventKey={String(instance.id)}
                >
                  <Accordion.Header>{instance.name}</Accordion.Header>
                  <Accordion.Body>
                    <Row className="mb-3">
                      <Col lg={6} md={12}>
                        <h6 className="text-muted">Instance Link</h6>
                        <a href={`/session/${instance.id}`}>
                          {`${window.location.origin}/session/${instance.id}`}
                        </a>
                      </Col>
                      <Col lg={3} xs={6} className="mb-3">
                        <h6 className="text-muted">Edit</h6>
                        <div>
                          <Link
                            to={`${window.location.origin}/session/edit/${instance.id}`}
                          >
                            Edit Instance
                          </Link>
                        </div>
                      </Col>
                      <Col lg={3} xs={6} className="mb-3">
                        <h6 className="text-muted">Edit</h6>
                        <div>
                          <Card.Link
                            style={{ cursor: "pointer" }}
                            onClick={() => props.deleteInstance(instance)}
                          >
                            Delete Instance
                          </Card.Link>
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg={6} md={12} className="mb-3">
                        <h6 className="text-muted">Description</h6>
                        <div>{instance.description}</div>
                      </Col>
                      <Col lg={3} xs={6} className="mb-3">
                        <h6 className="text-muted">Settings</h6>
                        <div>
                          <div>
                            <Badge bg="secondary">
                              slots [ {instance.settings.slots} ]
                            </Badge>
                          </div>
                          {instance.settings.slotPick ? (
                            <div>
                              <Badge bg="secondary">slotPick</Badge>
                            </div>
                          ) : null}
                          {instance.settings.randomPick ? (
                            <div>
                              <Badge bg="secondary">randomPick</Badge>
                            </div>
                          ) : null}
                          {instance.settings.sequentialPick ? (
                            <div>
                              <Badge bg="secondary">sequentialPick</Badge>
                            </div>
                          ) : null}
                        </div>
                      </Col>
                      <Col lg={3} xs={6}>
                        <h6 className="text-muted">Controls</h6>
                        <div className="small overflow-x-hidden">
                          {instance?.settings?.controls ? (
                            Object.entries(instance.settings.controls)
                              .filter(([key, val]) => !!val)
                              .map(([key, val]) => (
                                <div key={key}>
                                  <div>
                                    <div className="bg-black ps-2 rounded-top">
                                      {key}
                                    </div>
                                    <div className="bg-black ps-3 text-muted">
                                      {val.map((v) => (
                                        <div key={v.id}>
                                          {v.id}:{v.type}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ))
                          ) : (
                            <div>No controls available</div>
                          )}
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg={6} md={12} className="mb-3">
                        <h6 className="text-muted">Date Created</h6>
                        <div>
                          {new Date(instance.createdAt).toLocaleString()}
                        </div>
                      </Col>
                      <Col lg={3} xs={6} className="mb-3">
                        <h6 className="text-muted">Last Updated</h6>
                        <div>
                          {new Date(instance.updatedAt).toLocaleString()}
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <div>
                        <hr />
                        {instance.settings.slotPick && (
                          <>
                            <div className="mt-4 text-center">Choose Slot</div>
                            <div
                              className="btn-group d-flex flex-wrap"
                              role="group"
                              aria-label="Basic outlined example"
                            >
                              {SlotButtons(instance)}
                            </div>
                          </>
                        )}
                        {instance.settings.randomPick && (
                          <>
                            <div className="mt-4 text-center">
                              Take a randomly selected slot
                            </div>
                            <LinkButton
                              path={`/session/${instance.id}/0`}
                              label={"Join"}
                              variant={"outline-info"}
                            />
                          </>
                        )}
                        {instance.settings.sequentialPick && (
                          <>
                            <div className="mt-4 text-center">
                              Take next free slot
                            </div>
                            <LinkButton
                              path={`/session/${instance.id}/0`}
                              label={"Join"}
                              variant={"outline-info"}
                            />
                          </>
                        )}
                      </div>
                    </Row>
                  </Accordion.Body>
                </Accordion.Item>
              ))}
          </Accordion>
        ) : (
          <></>
        )}
      </div>
    </Col>
  );
};

export default observer(Join);
