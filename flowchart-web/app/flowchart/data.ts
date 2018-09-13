import { Edge } from './graph-entity';

// var DataEdges = [
//     new Edge(1, 3),
//     new Edge(1, 4),
//     new Edge(4, 2),
//     new Edge(2, 3),
//     new Edge(2, 5),
//     new Edge(5, 6),
// ];

var DataEdges3 = [
    new Edge("1", '2'),
    new Edge("1", '3'),
    new Edge("3", '4'),
    new Edge("4", '5'),
    new Edge("4", '6'),
    new Edge("5", '2'),
    new Edge("5", '7'),
    new Edge("5", '8'),
    new Edge("6", '3'),
    new Edge("8", '4'),
];


let DataEdges1 = [
    new Edge('1', '2'),
    new Edge('1', '3'),
    new Edge('1', '8'),
    new Edge('2', '4'),
    new Edge('2', '8'),
    new Edge('3', '4'),
    new Edge('3', '5'),
    new Edge('3', '6'),
    new Edge('3', '10'),
    new Edge('4', '8'),
    new Edge('5', '8'),
    new Edge('6', '7'),
    new Edge('7', '9'),
    new Edge('8', '9'),
    new Edge('8', '10'),
];

var DataEdges2 = [
    new Edge('1', '2'),
    new Edge('2', '3'),
    new Edge('2', '7'),
    new Edge('3', '4'),
    new Edge('4', '5'),
    new Edge('4', '6'),
    new Edge('5', '7'),
    new Edge('6', '8'),
    new Edge('7', '8'),
    new Edge('8', '9'),
];

let GraphData = [
    DataEdges3,
    DataEdges2,
    DataEdges1
]

export { GraphData };

