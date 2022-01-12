import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { BrowserRouter, Link } from "react-router-dom";
import {
  Routes,
  Route,
  useParams,
  useLocation,
  UNSAFE_RouteContext as RouteContext,
  UNSAFE_LocationContext as LocationContext,
} from "react-router";
import reactDom from "react-dom";

const TabContext = createContext();

function App() {
  const [tabs, setTabs] = useState(["home", "other", "a", "b"]);
  return (
    <TabContext.Provider value={{ tabs, setTabs }}>
      <BrowserRouter>
        <TabHeader />
        <TabBody />
        <Content />
      </BrowserRouter>
    </TabContext.Provider>
  );
}

function TabHeader() {
  const { tabs } = useContext(TabContext);
  return (
    <nav>
      {tabs.map((id) => (
        <span key={id}>
          <Link to={`/${id}`}>{id}</Link>
          &nbsp;|&nbsp;
        </span>
      ))}
      {tabs.map((id) => (
        <span key={id}>
          <Link to={`/${id}/other`}>{id}/other</Link>
          &nbsp;|&nbsp;
        </span>
      ))}
    </nav>
  );
}

function TabBody() {
  return (
    <Routes>
      <Route path="/:id/*" element={<TabContent />} />
    </Routes>
  );
}

function TabContent() {
  const { tabs } = useContext(TabContext);
  return (
    <div>
      {tabs.map((id) => (
        <FalseRoute key={id} id={id}>
          <Content />
        </FalseRoute>
      ))}
    </div>
  );
}

function FalseRoute({ id, children }) {
  const { id: activeId } = useParams();
  const active = useMemo(() => id === activeId, [activeId, id]);

  const route = useContext(RouteContext);
  const location = useContext(LocationContext);
  const [saved, setSaved] = useState({ route, location });

  useLayoutEffect(() => {
    if (active) setSaved({ route, location });
  }, [active, location, route]);

  return (
    <RouteContext.Provider value={saved.route}>
      <LocationContext.Provider value={saved.location}>
        <PortalHolder active={active}>{children}</PortalHolder>
      </LocationContext.Provider>
    </RouteContext.Provider>
  );
}

function PortalHolder({ active, children }) {
  const ref = useRef();
  const container = useMemo(() => document.createElement("div"), []);

  useLayoutEffect(() => {
    if (active) {
      ref.current.appendChild(container);
    } else if (ref.current.contains(container)) {
      ref.current.removeChild(container);
    }
  }, [active, container]);

  return <div ref={ref}>{reactDom.createPortal(children, container)}</div>;
}

function Content() {
  const { id } = useParams();
  const location = useLocation();
  const params = useParams();
  return (
    <Routes>
      <Route
        path="/other"
        element={
          <div>
            <input />
            {Array.from({ length: 100 }).map((_, key) => (
              <div key={id + key}>
                {id}
                {key}
              </div>
            ))}
          </div>
        }
      />
      <Route
        path="/*"
        element={
          <div>
            <input />
            <pre>{JSON.stringify(params, null, 4)}</pre>
            <pre>{JSON.stringify(location, null, 4)}</pre>
            <hr />
          </div>
        }
      />
    </Routes>
  );
}

export default App;
